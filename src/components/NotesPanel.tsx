import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Eye, HelpCircle, Loader2, NotebookPen, Pencil, Plus, Search, StickyNote, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, type Nota, type NotaTipo } from '@/lib/api';
import { cn, relativeTime } from '@/lib/utils';

const TIPOS: Record<NotaTipo, { label: string; icon: typeof BookOpen; variant: 'info' | 'heart' | 'accent' }> = {
  revision: { label: 'Revisión de tema', icon: BookOpen, variant: 'info' },
  pregunta: { label: 'Pregunta', icon: HelpCircle, variant: 'heart' },
  nota: { label: 'Nota', icon: StickyNote, variant: 'accent' },
};

const TEMPLATES: Record<NotaTipo, string> = {
  revision: '## Definición\n\n## Epidemiología\n\n## Fisiopatología\n\n## Clínica\n\n## Diagnóstico\n\n## Tratamiento\n\n## Relación con el caso\n\n## Bibliografía\n',
  pregunta: '**Pregunta:** \n\n**¿Quién la hizo?:** \n\n**Respuesta:** \n\n**Fuente:** \n',
  nota: '',
};

function NotaEditor({ nota, onDeleted }: { nota: Nota; onDeleted: () => void }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [title, setTitle] = useState(nota.title);
  const [content, setContent] = useState(nota.content);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ title, content });
  latest.current = { title, content };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api<Nota>(`/notas/${nota.id}`, { method: 'PATCH', json: latest.current });
      qc.setQueryData<Nota[]>(['notas', nota.historiaId], (prev) => prev?.map((n) => (n.id === saved.id ? { ...n, ...saved } : n)));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const schedule = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(save, 800);
  };

  // Guarda lo pendiente al cambiar de página o salir.
  useEffect(
    () => () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        api(`/notas/${nota.id}`, { method: 'PATCH', json: latest.current }).then(() =>
          qc.invalidateQueries({ queryKey: ['notas', nota.historiaId] }),
        );
      }
    },
    [nota.id],
  );

  const setTipo = async (tipo: NotaTipo) => {
    const saved = await api<Nota>(`/notas/${nota.id}`, { method: 'PATCH', json: { tipo } });
    qc.setQueryData<Nota[]>(['notas', nota.historiaId], (prev) => prev?.map((n) => (n.id === saved.id ? { ...n, ...saved } : n)));
  };

  const remove = async () => {
    const ok = await confirm({
      title: `¿Eliminar «${title || 'Sin título'}»?`,
      description: 'Se borrará esta página y su contenido. No se puede deshacer.',
      icon: Trash2,
    });
    if (!ok) return;
    window.clearTimeout(timer.current);
    timer.current = undefined;
    await api(`/notas/${nota.id}`, { method: 'DELETE' });
    qc.invalidateQueries({ queryKey: ['notas', nota.historiaId] });
    qc.invalidateQueries({ queryKey: ['historias'] });
    onDeleted();
  };

  return (
    <div className="soft-card flex min-h-[640px] flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(TIPOS) as NotaTipo[]).map((t) => {
          const Icon = TIPOS[t].icon;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition',
                nota.tipo === t ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" /> {TIPOS[t].label}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
          {saving ? <Loader2 className="size-3 animate-spin" /> : null}
          {saving ? 'Guardando' : `Editada ${relativeTime(nota.updatedAt)}`}
        </span>
        <Button size="sm" variant="secondary" onClick={() => setPreview(!preview)}>
          {preview ? <Pencil /> : <Eye />} {preview ? 'Editar' : 'Vista'}
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Eliminar página" onClick={remove}>
          <Trash2 />
        </Button>
      </div>
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          schedule();
        }}
        placeholder="Título de la página"
        className="mt-5 w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
      />
      {preview ? (
        <div className="prose-chat mt-4 flex-1 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '_Página vacía_'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            schedule();
          }}
          placeholder="Escribe aquí... (admite Markdown: ## títulos, **negrita**, - listas)"
          className="mt-4 w-full flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
        />
      )}
    </div>
  );
}

export function NotesPanel({ historiaId }: { historiaId: string }) {
  const qc = useQueryClient();
  const { data: notas = [], isLoading } = useQuery({
    queryKey: ['notas', historiaId],
    queryFn: () => api<Nota[]>(`/historias/${historiaId}/notas`),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!selected && notas.length) setSelected(notas[0].id);
  }, [notas, selected]);

  const create = useMutation({
    mutationFn: (tipo: NotaTipo) =>
      api<Nota>(`/historias/${historiaId}/notas`, {
        method: 'POST',
        json: { tipo, title: tipo === 'revision' ? 'Revisión de tema' : tipo === 'pregunta' ? 'Pregunta' : 'Nota', content: TEMPLATES[tipo] },
      }),
    onSuccess: (n) => {
      qc.setQueryData<Nota[]>(['notas', historiaId], (prev = []) => [n, ...prev]);
      qc.invalidateQueries({ queryKey: ['historias'] });
      setSelected(n.id);
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = notas.filter((n) => {
    const q = query.trim().toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });
  const current = notas.find((n) => n.id === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="soft-card flex flex-col gap-3 self-start p-4">
        <div className="flex items-center gap-2">
          <NotebookPen className="size-4" />
          <p className="mr-auto font-semibold">Páginas del caso</p>
          <Badge variant="muted">{notas.length}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(TIPOS) as NotaTipo[]).map((t) => {
            const Icon = TIPOS[t].icon;
            return (
              <button
                key={t}
                type="button"
                disabled={create.isPending}
                onClick={() => create.mutate(t)}
                className="flex flex-col items-center gap-1 rounded-xl border border-dashed bg-shell p-2 text-[11px] font-medium transition hover:border-ring hover:bg-card"
              >
                <span className="flex items-center gap-0.5">
                  <Plus className="size-3" />
                  <Icon className="size-3.5" />
                </span>
                {t === 'revision' ? 'Revisión' : TIPOS[t].label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-8" placeholder="Buscar en las páginas" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex max-h-[520px] flex-col gap-1 overflow-y-auto">
          {isLoading && <Loader2 className="mx-auto my-6 size-5 animate-spin text-muted-foreground" />}
          {!isLoading && filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Crea páginas para revisiones de tema o para anotar lo que te pregunten en la ronda.
            </p>
          )}
          {filtered.map((n) => {
            const Icon = TIPOS[n.tipo].icon;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl p-2.5 text-left transition',
                  n.id === selected ? 'bg-secondary' : 'hover:bg-shell',
                )}
              >
                <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full', n.tipo === 'revision' ? 'bg-info-soft text-info' : n.tipo === 'pregunta' ? 'bg-heart-soft text-heart' : 'bg-accent/60')}>
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{n.title || 'Sin título'}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {TIPOS[n.tipo].label} · {relativeTime(n.updatedAt)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {current ? (
        <NotaEditor key={current.id} nota={current} onDeleted={() => setSelected(null)} />
      ) : (
        <div className="soft-card flex min-h-[400px] flex-col items-center justify-center gap-3 p-10 text-center">
          <BookOpen className="size-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Cada caso puede tener sus propias páginas: revisiones de tema con plantilla, preguntas de la ronda o notas
            libres.
          </p>
          <Button variant="accent" onClick={() => create.mutate('revision')}>
            <Plus /> Nueva revisión de tema
          </Button>
        </div>
      )}
    </div>
  );
}
