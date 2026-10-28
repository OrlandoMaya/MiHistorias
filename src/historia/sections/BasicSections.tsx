import { CircleCheck, CircleDot, Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ageFrom, cn, uid } from '@/lib/utils';
import { useEditor, useField } from '../editor-context';
import { ChipGroup, FieldInput, FieldTextarea } from '../fields';
import {
  ANTECEDENTES_FIELDS,
  GINECO_FIELDS,
  IDENTIFICACION_FIELDS,
  PLAN_FIELDS,
  REVISION_SISTEMAS,
  type SectionDef,
} from '../schema';
import { SectionCard, SubBlock } from '../SectionCard';
import type { Problema } from '../types';

export interface SectionProps {
  section: SectionDef;
  index: number;
  done: boolean;
}

export function IdentificacionSection(props: SectionProps) {
  const { data, set } = useEditor();
  const fechaNacimiento = data.identificacion?.fechaNacimiento;
  const edadCalculada = ageFrom(fechaNacimiento);

  return (
    <SectionCard {...props}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {IDENTIFICACION_FIELDS.map((f) => (
          <FieldInput
            key={f.key}
            path={`identificacion.${f.key}`}
            def={f}
            className={f.key === 'nombre' ? 'sm:col-span-2' : undefined}
          />
        ))}
      </div>
      {edadCalculada !== null && data.identificacion?.edad !== `${edadCalculada} años` && (
        <button
          type="button"
          className="mt-3 text-xs font-medium text-info hover:underline"
          onClick={() => set('identificacion.edad', `${edadCalculada} años`)}
        >
          Usar edad calculada: {edadCalculada} años
        </button>
      )}
    </SectionCard>
  );
}

export function MotivoSection(props: SectionProps) {
  return (
    <SectionCard {...props}>
      <FieldTextarea
        path="motivoConsulta"
        rows={2}
        placeholder={'Entre comillas, en palabras del paciente: "me duele el pecho"'}
      />
    </SectionCard>
  );
}

export function EnfermedadSection(props: SectionProps) {
  return (
    <SectionCard {...props}>
      <FieldTextarea
        path="enfermedadActual"
        rows={9}
        placeholder="Cronología del cuadro: inicio, evolución, características del síntoma principal (ALICIA / OPQRST), síntomas asociados, tratamientos recibidos y motivo por el que consulta hoy."
      />
    </SectionCard>
  );
}

export function AntecedentesSection(props: SectionProps) {
  const { data } = useEditor();
  const esMujer = data.identificacion?.sexo === 'Femenino';
  return (
    <SectionCard {...props}>
      <div className="grid gap-4 md:grid-cols-2">
        {ANTECEDENTES_FIELDS.map((f) => (
          <FieldTextarea
            key={f.key}
            path={`antecedentes.${f.key}`}
            label={f.label}
            placeholder={f.placeholder}
            rows={2}
          />
        ))}
      </div>
      {esMujer ? (
        <SubBlock title="Ginecoobstétricos" className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {GINECO_FIELDS.map((f) => (
              <FieldInput
                key={f.key}
                path={`antecedentes.gineco.${f.key}`}
                def={f}
                className={['citologia', 'mamografia', 'planificacion', 'ciclos'].includes(f.key) ? 'col-span-2' : undefined}
              />
            ))}
          </div>
          <FieldTextarea path="antecedentes.gineco.otros" label="Otros / observaciones" rows={2} className="mt-3" />
        </SubBlock>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Los antecedentes ginecoobstétricos aparecen cuando el sexo en Identificación es «Femenino».
        </p>
      )}
    </SectionCard>
  );
}

export function RevisionSistemasSection(props: SectionProps) {
  const { data, set } = useEditor();
  const positivos = REVISION_SISTEMAS.reduce(
    (n, s) => n + (data.revisionSistemas?.[s.key]?.items?.length ?? 0),
    0,
  );
  return (
    <SectionCard
      {...props}
      actions={
        <span className="text-xs text-muted-foreground">
          {positivos} síntoma{positivos === 1 ? '' : 's'} positivo{positivos === 1 ? '' : 's'}
        </span>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Marca solo los síntomas que el paciente <b>sí</b> refiere. Lo que no se marque se reporta como negado.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {REVISION_SISTEMAS.map((sistema) => {
          const count = data.revisionSistemas?.[sistema.key]?.items?.length ?? 0;
          return (
            <SubBlock key={sistema.key} title={`${sistema.title}${count ? ` · ${count}` : ''}`}>
              <ChipGroup path={`revisionSistemas.${sistema.key}.items`} options={sistema.items} tone="heart" />
              <Input
                className="mt-3 h-9 bg-card"
                placeholder="Detalles u otros síntomas..."
                value={data.revisionSistemas?.[sistema.key]?.notas ?? ''}
                onChange={(e) => set(`revisionSistemas.${sistema.key}.notas`, e.target.value)}
              />
            </SubBlock>
          );
        })}
      </div>
    </SectionCard>
  );
}

export function DxEtioSection(props: SectionProps) {
  return (
    <SectionCard {...props}>
      <div className="grid gap-4 md:grid-cols-2">
        <FieldTextarea
          path="dxSindromatico"
          label="Diagnóstico sindromático"
          rows={5}
          placeholder="Síndrome febril, síndrome de respuesta inflamatoria sistémica, síndrome edematoso..."
        />
        <FieldTextarea
          path="dxEtiologico"
          label="Diagnóstico etiológico"
          rows={5}
          placeholder="Causa más probable del cuadro: infecciosa, autoinmune, neoplásica..."
        />
      </div>
    </SectionCard>
  );
}

export function DiagnosticoSection(props: SectionProps) {
  return (
    <SectionCard {...props}>
      <FieldTextarea
        path="diagnostico"
        rows={5}
        placeholder={'1. Diagnóstico principal (CIE-10 si aplica)\n2. Diagnósticos secundarios\n3. Comorbilidades'}
      />
    </SectionCard>
  );
}

export function PlanSection(props: SectionProps) {
  return (
    <SectionCard {...props}>
      <div className="grid gap-4 md:grid-cols-2">
        {PLAN_FIELDS.map((f) => (
          <FieldTextarea
            key={f.key}
            path={`plan.${f.key}`}
            label={f.label}
            placeholder={f.placeholder}
            rows={f.key === 'medicamentos' ? 5 : 2}
            className={f.key === 'medicamentos' ? 'md:col-span-2' : undefined}
          />
        ))}
      </div>
    </SectionCard>
  );
}

export function ProblemasSection(props: SectionProps) {
  const [problemas = [], setProblemas] = useField<Problema[]>('problemas');
  const confirm = useConfirm();
  const update = (id: string, patch: Partial<Problema>) =>
    setProblemas(problemas.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <SectionCard {...props}>
      <ol className="flex flex-col gap-2">
        {problemas.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="w-6 text-right text-sm font-semibold text-muted-foreground">{i + 1}.</span>
            <Input
              value={p.texto}
              placeholder="Describe el problema"
              onChange={(e) => update(p.id, { texto: e.target.value })}
              className={cn(p.estado === 'resuelto' && 'text-muted-foreground line-through')}
            />
            <Button
              type="button"
              size="sm"
              variant={p.estado === 'activo' ? 'secondary' : 'outline'}
              className={cn('w-28', p.estado === 'activo' ? 'text-heart' : 'text-good')}
              onClick={() => update(p.id, { estado: p.estado === 'activo' ? 'resuelto' : 'activo' })}
            >
              {p.estado === 'activo' ? <CircleDot /> : <CircleCheck />}
              {p.estado === 'activo' ? 'Activo' : 'Resuelto'}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Eliminar problema"
              onClick={async () => {
                const ok =
                  !p.texto.trim() ||
                  (await confirm({ title: '¿Eliminar este problema?', description: `«${p.texto}»`, icon: Trash2 }));
                if (ok) setProblemas((prev = []) => prev.filter((x) => x.id !== p.id));
              }}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        onClick={() => setProblemas([...problemas, { id: uid(), texto: '', estado: 'activo' }])}
      >
        <Plus /> Agregar problema
      </Button>
    </SectionCard>
  );
}
