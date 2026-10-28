import Anthropic from '@anthropic-ai/sdk';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Historia } from '../historias/historia.entity';

export type AiMode = 'analisis' | 'diferenciales' | 'general';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const BASE_PROMPT = `Eres un asistente clínico para estudiantes de medicina e internas/os en Colombia que están elaborando historias clínicas académicas.
Respondes siempre en español, con lenguaje médico preciso y formato claro (párrafos cortos y listas cuando ayuden).
Basas tus respuestas en los datos de la historia clínica que se te entregan. Si un dato importante falta, dilo y sugiere qué preguntar o examinar.
No inventes hallazgos que no estén en la historia. Recuerda que tu respuesta es un apoyo académico: el juicio clínico final es de quien atiende al paciente.`;

const MODE_PROMPTS: Record<AiMode, string> = {
  analisis: `Tarea: ayudar a redactar el ANÁLISIS de la historia clínica.
Un buen análisis integra: presentación del paciente (edad, sexo, antecedentes relevantes), cuadro clínico y tiempo de evolución, hallazgos positivos y negativos pertinentes del examen físico, paraclínicos e imágenes, agrupación en síndromes, razonamiento fisiopatológico hacia el diagnóstico más probable, diferenciales principales y su justificación, y la conducta que se deriva.
Cuando te pidan una redacción, entrégala en prosa lista para pegar en la historia, sin encabezados de chat.`,
  diferenciales: `Tarea: ayudar a construir los DIAGNÓSTICOS DIFERENCIALES.
Para cada diferencial indica: a favor (datos de la historia), en contra, y qué estudio o hallazgo lo confirmaría o descartaría. Ordénalos de más a menos probable y señala los que no se pueden dejar pasar por su gravedad.`,
  general: `Tarea: responder preguntas sobre el caso y ayudar con revisiones de tema relacionadas.`,
};

@Injectable()
export class AiService {
  private client?: Anthropic;

  private getClient() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ServiceUnavailableException(
        'El asistente IA no está configurado: agrega ANTHROPIC_API_KEY en el archivo .env y reinicia los contenedores.',
      );
    }
    this.client ??= new Anthropic();
    return this.client;
  }

  async *streamChat(historia: Historia, mode: AiMode, turns: ChatTurn[]): AsyncGenerator<string> {
    const client = this.getClient();
    const system = `${BASE_PROMPT}\n\n${MODE_PROMPTS[mode]}\n\n<historia_clinica>\n${JSON.stringify(
      historia.data ?? {},
      null,
      1,
    )}\n</historia_clinica>`;

    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      system,
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
      output_config: { effort: 'medium' },
      // Si el modelo declina por política, el servidor reintenta con el modelo de respaldo recomendado.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }

    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      yield '\n\n_(El asistente no pudo responder esta solicitud. Intenta reformularla.)_';
    } else if (final.stop_reason === 'max_tokens') {
      yield '\n\n_(Respuesta cortada por longitud.)_';
    }
  }
}
