import Anthropic from '@anthropic-ai/sdk';
import { Body, Controller, HttpException, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import type { Response } from 'express';
import { AuthGuard, AuthUser, CurrentUser } from '../auth/auth.guard';
import { HistoriasService } from '../historias/historias.service';
import { AiMode, AiService } from './ai.service';

class ChatTurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

class ChatDto {
  @IsIn(['analisis', 'diferenciales', 'general'])
  mode: AiMode;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  messages: ChatTurnDto[];
}

@Controller('historias/:id/ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly historias: HistoriasService,
  ) {}

  /** Responde como Server-Sent Events: `data: {"text": "..."}` por fragmento y `data: [DONE]` al final. */
  @Post('chat')
  async chat(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    const historia = await this.historias.get(user.id, id);
    const chunks = this.ai.streamChat(historia, dto.mode, dto.messages);

    // Pide el primer fragmento antes de abrir el stream para poder devolver errores como HTTP normal.
    let first: IteratorResult<string>;
    try {
      first = await chunks.next();
    } catch (err) {
      const status = err instanceof HttpException ? err.getStatus() : 502;
      return res.status(status).json({ message: describeError(err) });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const send = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

    try {
      if (!first.done) send({ text: first.value });
      for await (const text of chunks) send({ text });
    } catch (err) {
      send({ error: describeError(err) });
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

function describeError(err: unknown): string {
  if (err instanceof HttpException) return err.message;
  if (err instanceof Anthropic.AuthenticationError) return 'La ANTHROPIC_API_KEY no es válida.';
  if (err instanceof Anthropic.RateLimitError) return 'Límite de uso de la IA alcanzado, intenta en un momento.';
  if (err instanceof Anthropic.APIError) return `Error del servicio de IA (${err.status ?? 'sin estado'}).`;
  return 'No se pudo contactar al asistente IA.';
}
