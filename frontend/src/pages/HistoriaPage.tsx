import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CloudOff,
  Droplet,
  FileHeart,
  Loader2,
  NotebookPen,
  Printer,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm';
import { NotesPanel } from '@/components/NotesPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { completionPercent, sectionStatus } from '@/historia/completion';
import { EditorContext, type EditorState } from '@/historia/editor-context';
import { SECTIONS } from '@/historia/schema';
import { AnalisisSection, DiferencialesSection } from '@/historia/sections/AiSections';
import {
  AntecedentesSection,
  DiagnosticoSection,
  DxEtioSection,
  EnfermedadSection,
  IdentificacionSection,
  MotivoSection,
  PlanSection,
  ProblemasSection,
  RevisionSistemasSection,
  type SectionProps,
} from '@/historia/sections/BasicSections';
import { ExamenFisicoSection } from '@/historia/sections/ExamenFisicoSection';
import { ImagenesSection } from '@/historia/sections/ImagenesSection';
import { ParaclinicosSection } from '@/historia/sections/ParaclinicosSection';
import type { HistoriaData } from '@/historia/types';
import { api, type Historia, type HistoriaStatus } from '@/lib/api';
import { cn, getIn, initials, setIn } from '@/lib/utils';
import { STATUS_LABEL, useConfirmedStatus, useDeleteHistoria } from './useHistorias';

const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  identificacion: IdentificacionSection,
  motivo: MotivoSection,
  enfermedad: EnfermedadSection,
  antecedentes: AntecedentesSection,
  rxs: RevisionSistemasSection,
  examen: ExamenFisicoSection,
  paraclinicos: ParaclinicosSection,
  imagenes: ImagenesSection,
  analisis: AnalisisSection,
  dxEtio: DxEtioSection,
  diferenciales: DiferencialesSection,
  problemas: ProblemasSection,
  diagnostico: DiagnosticoSection,
  plan: PlanSection,
};

type SaveState = 'saved' | 'pending' | 'saving' | 'error';

/** Estado local de la historia con autoguardado (debounce) hacia el backend. */
function useAutosave(historia: Historia) {
  const qc = useQueryClient();
  const [data, setData] = useState<HistoriaData>(historia.data ?? {});
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const latest = useRef(data);
  const dirty = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const inflight = useRef<Promise<void> | null>(null);

  const flush = useCallback(async (): Promise<void> => {
    window.clearTimeout(timer.current);
    if (inflight.current) await inflight.current;
    if (!dirty.current) return;
    dirty.current = false;
    setSaveState('saving');
    inflight.current = api<Historia>(`/historias/${historia.id}`, { method: 'PATCH', json: { data: latest.current } })
      .then((saved) => {
        qc.setQueryData(['historia', historia.id], { ...saved, data: latest.current });
        qc.invalidateQueries({ queryKey: ['historias'] });
        setSaveState(dirty.current ? 'pending' : 'saved');
      })
      .catch((e) => {
        dirty.current = true;
        setSaveState('error');
        toast.error(`No se pudo guardar: ${e.message}`);
      })
      .finally(() => {
        inflight.current = null;
      });
    await inflight.current;
  }, [historia.id, qc]);

  const set = useCallback(
    (path: string, value: unknown) => {
      setData((prev) => {
        const resolved = typeof value === 'function' ? value(getIn(prev, path)) : value;
        const next = setIn(prev, path, resolved);
        latest.current = next;
        return next;
      });
      dirty.current = true;
      setSaveState('pending');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 900);
    },
    [flush],
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      // Al salir de la página se guarda lo pendiente.
      if (dirty.current) flush();
    };
  }, [flush]);

  return { data, set, flush, saveState };
}

function SaveIndicator({ state }: { state: SaveState }) {
  const map = {
    saved: { icon: Check, text: 'Guardado', cls: 'text-good' },
    pending: { icon: Loader2, text: 'Cambios sin guardar', cls: 'text-muted-foreground' },
    saving: { icon: Loader2, text: 'Guardando…', cls: 'text-muted-foreground' },
    error: { icon: CloudOff, text: 'Error al guardar', cls: 'text-destructive' },
  }[state];
  const Icon = map.icon;
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-medium', map.cls)}>
      <Icon className={cn('size-3.5', state === 'saving' && 'animate-spin')} />
      {map.text}
    </span>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-14">
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--secondary)" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={value === 100 ? 'var(--good)' : 'var(--heart)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{value}%</span>
    </div>
  );
}

function Editor({ historia }: { historia: Historia }) {
  const navigate = useNavigate();
  const { data, set, flush, saveState } = useAutosave(historia);
  const changeStatus = useConfirmedStatus();
  const remove = useDeleteHistoria();
  const confirm = useConfirm();
  const [tab, setTab] = useState('historia');
  const [active, setActive] = useState(SECTIONS[0].id);

  const status = useMemo(() => sectionStatus(data), [data]);
  const pct = completionPercent(data);
  const id = data.identificacion ?? {};
  const alergias = data.antecedentes?.alergias?.trim();

  const ctx: EditorState = useMemo(
    () => ({ historiaId: historia.id, data, set, saveNow: flush }),
    [historia.id, data, set, flush],
  );

  // Resalta en el índice la sección visible.
  useEffect(() => {
    if (tab !== 'historia') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace('sec-', ''));
      },
      { rootMargin: '-120px 0px -55% 0px' },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`sec-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tab]);

  return (
    <EditorContext.Provider value={ctx}>
      <div className="flex flex-col gap-5">
        {/* Encabezado del paciente */}
        <div className="soft-card flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <Button asChild size="icon" variant="secondary" className="no-print">
            <Link to="/" aria-label="Volver">
              <ArrowLeft />
            </Link>
          </Button>
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-lg font-semibold">
            {initials(id.nombre || '?')}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{id.nombre || 'Nuevo paciente'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {[id.documento, id.edad, id.sexo].filter(Boolean).join(' · ') || 'Completa la identificación'}
              {id.hemoclasificacion && (
                <Badge variant="heart">
                  <Droplet /> {id.hemoclasificacion}
                </Badge>
              )}
              {alergias && !/^(niega|no refiere|ninguna|no)\b/i.test(alergias) && (
                <Badge variant="heart" title={alergias}>
                  <AlertTriangle /> Alergias
                </Badge>
              )}
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center gap-3">
            <SaveIndicator state={saveState} />
            <ProgressRing value={pct} />
            <Select
              value={historia.status}
              onValueChange={(v) => changeStatus(historia.id, v as HistoriaStatus, id.nombre)}
            >
              <SelectTrigger className="h-10 w-36 rounded-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as HistoriaStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Imprimir"
              onClick={async () => {
                setTab('historia');
                await flush();
                setTimeout(() => window.print(), 150);
              }}
            >
              <Printer />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Eliminar historia"
              onClick={async () => {
                const ok = await confirm({
                  title: `¿Eliminar la historia de ${id.nombre || 'este paciente'}?`,
                  description: 'Se borrarán también todas sus páginas de revisión y notas. No se puede deshacer.',
                  icon: Trash2,
                });
                if (ok) remove.mutate(historia.id, { onSuccess: () => navigate('/') });
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="no-print">
            <TabsTrigger value="historia">
              <FileHeart /> Historia clínica
            </TabsTrigger>
            <TabsTrigger value="notas">
              <NotebookPen /> Revisiones y notas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historia">
            <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
              <nav className="no-print hidden lg:block">
                <div className="soft-card sticky top-24 flex flex-col gap-0.5 p-2">
                  {SECTIONS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.id}
                        href={`#sec-${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition',
                          active === s.id ? 'bg-primary text-primary-foreground' : 'text-foreground/75 hover:bg-secondary',
                        )}
                      >
                        <span className="w-4 text-center text-[11px] opacity-60">{i + 1}</span>
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{s.title}</span>
                        {status[s.id] && (
                          <span className={cn('size-1.5 rounded-full', active === s.id ? 'bg-accent' : 'bg-good')} />
                        )}
                      </a>
                    );
                  })}
                </div>
              </nav>
              <div className="flex min-w-0 flex-col gap-5">
                {SECTIONS.map((s, i) => {
                  const Component = SECTION_COMPONENTS[s.id];
                  return <Component key={s.id} section={s} index={i} done={status[s.id]} />;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notas">
            <NotesPanel historiaId={historia.id} />
          </TabsContent>
        </Tabs>
      </div>
    </EditorContext.Provider>
  );
}

export default function HistoriaPage() {
  const { id } = useParams<{ id: string }>();
  const { data: historia, isLoading, error } = useQuery({
    queryKey: ['historia', id],
    queryFn: () => api<Historia>(`/historias/${id}`),
    enabled: !!id,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !historia) {
    return (
      <div className="soft-card mx-auto mt-10 max-w-md p-8 text-center">
        <p className="text-sm text-muted-foreground">No se encontró la historia.</p>
        <Button asChild className="mt-4">
          <Link to="/">Volver</Link>
        </Button>
      </div>
    );
  }
  return <Editor key={historia.id} historia={historia} />;
}
