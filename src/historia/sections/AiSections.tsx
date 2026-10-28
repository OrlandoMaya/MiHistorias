import { toast } from 'sonner';
import { AiChat } from '@/components/AiChat';
import { useEditor } from '../editor-context';
import { FieldTextarea } from '../fields';
import { SectionCard } from '../SectionCard';
import type { SectionProps } from './BasicSections';

function useInsert(path: 'analisis' | 'dxDiferenciales') {
  const { set } = useEditor();
  return (text: string, how: 'append' | 'replace') => {
    set(path, (prev: string | undefined) => (how === 'replace' || !prev?.trim() ? text : `${prev.trimEnd()}\n\n${text}`));
    toast.success(how === 'replace' ? 'Texto reemplazado' : 'Texto insertado');
  };
}

export function AnalisisSection(props: SectionProps) {
  const { historiaId, saveNow } = useEditor();
  const insert = useInsert('analisis');
  return (
    <SectionCard {...props}>
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldTextarea
          path="analisis"
          rows={18}
          placeholder="Paciente de __ años con antecedente de __ que consulta por __ de __ días de evolución..."
          hint="Puedes pedirle a la IA un borrador y luego ajustarlo con tu propio razonamiento."
        />
        <AiChat
          historiaId={historiaId}
          mode="analisis"
          title="Asistente de análisis"
          beforeSend={saveNow}
          onInsert={insert}
          suggestions={[
            'Redacta un borrador del análisis con lo que hay',
            '¿Qué datos faltan para un buen análisis?',
            'Revisa y mejora la redacción de mi análisis',
            'Agrupa los hallazgos en síndromes',
          ]}
        />
      </div>
    </SectionCard>
  );
}

export function DiferencialesSection(props: SectionProps) {
  const { historiaId, saveNow } = useEditor();
  const insert = useInsert('dxDiferenciales');
  return (
    <SectionCard {...props}>
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldTextarea
          path="dxDiferenciales"
          rows={18}
          placeholder={'1. Diagnóstico — a favor: ... / en contra: ... / para confirmar: ...\n2. ...'}
        />
        <AiChat
          historiaId={historiaId}
          mode="diferenciales"
          title="Asistente de diferenciales"
          beforeSend={saveNow}
          onInsert={insert}
          suggestions={[
            'Propón los diagnósticos diferenciales',
            '¿Qué diferencial grave no debo pasar por alto?',
            '¿Qué estudios ayudarían a diferenciarlos?',
          ]}
        />
      </div>
    </SectionCard>
  );
}
