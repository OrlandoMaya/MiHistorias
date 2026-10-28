import {
  Archive,
  ArrowUpRight,
  CheckCircle2,
  Droplet,
  FileText,
  HeartPulse,
  MoreHorizontal,
  NotebookPen,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BodyFigure } from '@/components/BodyFigure';
import { useConfirm } from '@/components/confirm';
import { Gauge } from '@/components/Gauge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { completionPercent } from '@/historia/completion';
import type { Historia, HistoriaStatus } from '@/lib/api';
import { cn, initials, relativeTime } from '@/lib/utils';
import { STATUS_LABEL, useConfirmedStatus, useCreateHistoria, useDeleteHistoria, useHistorias } from './useHistorias';

const AVATAR_TONES = ['bg-accent', 'bg-heart-soft text-heart', 'bg-info-soft text-info', 'bg-good-soft text-good'];
const avatarTone = (id: string) => AVATAR_TONES[id.charCodeAt(0) % AVATAR_TONES.length];

function Sparkline({ values, color = 'var(--heart)' }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${36 - (v / max) * 30}`);
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {values.length > 0 && (
        <circle
          cx={pts[pts.length - 1].split(',')[0]}
          cy={pts[pts.length - 1].split(',')[1]}
          r="2.2"
          fill={color}
        />
      )}
    </svg>
  );
}

function lastDays(historias: Historia[], days: number, field: 'createdAt' | 'updatedAt') {
  const counts = Array(days).fill(0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (const h of historias) {
    const d = new Date(h[field]);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((start.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < days) counts[days - 1 - diff]++;
  }
  return counts;
}

function patientMeta(h: Historia) {
  const id = h.data?.identificacion ?? {};
  return [id.edad, id.sexo].filter(Boolean).join(' · ');
}

export default function DashboardPage() {
  const { data: historias = [], isLoading } = useHistorias();
  const create = useCreateHistoria();
  const changeStatus = useConfirmedStatus();
  const remove = useDeleteHistoria();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoriaStatus | 'todas'>('activa');

  const stats = useMemo(() => {
    const by = (s: HistoriaStatus) => historias.filter((h) => h.status === s).length;
    const notas = historias.reduce((n, h) => n + (h.notasCount ?? 0), 0);
    const avg = historias.length
      ? Math.round(historias.reduce((n, h) => n + completionPercent(h.data), 0) / historias.length)
      : 0;
    return { activas: by('activa'), alta: by('alta'), archivadas: by('archivada'), notas, avg };
  }, [historias]);

  const visibles = historias.filter((h) => {
    if (filter !== 'todas' && h.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const d = h.data ?? {};
    return [h.patientName, h.documento, d.diagnostico, d.motivoConsulta].some((v) => v?.toLowerCase().includes(q));
  });

  const nueva = () => create.mutate(undefined, { onSuccess: (h) => navigate(`/historias/${h.id}`) });
  const activity = lastDays(historias, 21, 'updatedAt');
  const created = lastDays(historias, 14, 'createdAt');
  const recientes = historias.slice(0, 2);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <h1 className="pt-2 pb-2 text-5xl leading-[1.02] font-semibold tracking-tight">
            Historias
            <br />
            Clínicas
          </h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="soft-card p-4">
              <div className="flex items-center justify-between">
                <Users className="size-4 text-heart" />
                <Badge variant="accent">{stats.activas} activas</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Pacientes</p>
              <p className="text-3xl font-semibold">
                {historias.length}
                <span className="text-base font-normal text-muted-foreground"> total</span>
              </p>
              <div className="mt-2 rounded-xl bg-shell px-1">
                <Sparkline values={created} />
              </div>
            </div>
            <div className="soft-card p-4">
              <div className="flex items-center justify-between">
                <NotebookPen className="size-4 text-info" />
                <Badge variant="info">revisiones</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Notas de estudio</p>
              <p className="text-3xl font-semibold">
                {stats.notas}
                <span className="text-base font-normal text-muted-foreground"> páginas</span>
              </p>
              <div className="mt-2 rounded-xl bg-shell px-1">
                <Sparkline values={activity.slice(-14)} color="var(--info)" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recientes.map((h) => (
              <Link key={h.id} to={`/historias/${h.id}`} className="soft-card group flex flex-col p-4 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold">{relativeTime(h.updatedAt)}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Última edición</span>
                <div className="mt-6 flex items-center gap-2">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold', avatarTone(h.id))}>
                    {initials(h.patientName || '?')}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold">{h.patientName || 'Sin nombre'}</p>
                    <p className="truncate text-xs text-muted-foreground">{patientMeta(h) || '—'}</p>
                  </div>
                </div>
              </Link>
            ))}
            {recientes.length < 2 && (
              <div className="soft-card flex items-center justify-center p-4 text-center text-xs text-muted-foreground">
                Aquí verás tus últimas historias editadas
              </div>
            )}
          </div>
          <div className="soft-card flex items-center gap-2 p-2">
            <Button
              size="icon"
              variant="secondary"
              aria-label="Buscar paciente"
              onClick={() => document.getElementById('buscar')?.focus()}
            >
              <Search />
            </Button>
            <Button variant="accent" size="lg" className="flex-1 justify-between pr-2" onClick={nueva} disabled={create.isPending}>
              Nueva historia clínica
              <span className="flex size-8 items-center justify-center rounded-full bg-card">
                <ArrowUpRight />
              </span>
            </Button>
          </div>
        </div>

        {/* Figura central */}
        <div className="relative hidden flex-col items-center justify-center lg:col-span-4 lg:flex">
          <BodyFigure
            className="max-w-[380px]"
            spots={[
              { key: 'activas', label: `${stats.activas} activas`, x: 112, y: 116, side: 'right', labelY: 112, tone: 'heart', onClick: () => setFilter('activa') },
              { key: 'alta', label: `${stats.alta} de alta`, x: 92, y: 176, side: 'left', labelY: 172, tone: 'good', onClick: () => setFilter('alta') },
              { key: 'arch', label: `${stats.archivadas} archivadas`, x: 110, y: 222, side: 'right', labelY: 232, tone: 'none', onClick: () => setFilter('archivada') },
              { key: 'notas', label: `${stats.notas} notas`, x: 78, y: 330, side: 'left', labelY: 322, tone: 'info' },
            ]}
          />
          <svg viewBox="0 0 300 40" className="-mt-4 w-full max-w-[380px]" aria-hidden>
            {Array.from({ length: 61 }, (_, i) => {
              const x = 10 + i * 4.67;
              const y = 6 + Math.pow((i - 30) / 30, 2) * 22;
              return <line key={i} x1={x} y1={y} x2={x} y2={y + (i % 5 === 0 ? 10 : 6)} stroke="#0f1419" strokeOpacity={i % 5 === 0 ? 0.3 : 0.15} />;
            })}
            <circle cx="150" cy="10" r="6" fill="#0f1419" />
            <circle cx="150" cy="10" r="2.5" fill="#fff" />
          </svg>
          <p className="text-xs font-medium text-muted-foreground">{historias.length} pacientes registrados</p>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="soft-card p-4">
              <Droplet className="size-4 text-heart" />
              <p className="mt-2 text-xs text-muted-foreground">Historias completas</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-2xl font-semibold">{historias.filter((h) => completionPercent(h.data) === 100).length}</p>
                <span className="text-[11px] text-good">• 100 %</span>
              </div>
            </div>
            <div className="soft-card p-4">
              <HeartPulse className="size-4 text-heart" />
              <p className="mt-2 text-xs text-muted-foreground">Editadas hoy</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-2xl font-semibold">{activity[activity.length - 1]}</p>
                <span className="text-[11px] text-good">• Al día</span>
              </div>
            </div>
          </div>

          <div className="soft-card p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4" />
              <p className="text-sm font-semibold">Completitud promedio</p>
            </div>
            <Gauge
              value={stats.avg}
              center={
                <>
                  <HeartPulse className="size-4 text-heart" />
                  <p className="text-3xl font-semibold">
                    {stats.avg}
                    <span className="text-sm font-normal text-muted-foreground"> %</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">de las secciones llenas</p>
                </>
              }
            />
            <div className="mt-3 flex justify-between rounded-xl bg-shell px-3 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-heart" /> Alta</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-heart/60" /> Media</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-heart/30" /> Baja</span>
            </div>
          </div>

          <div className="soft-card p-4">
            <p className="text-sm font-semibold">Actividad</p>
            <p className="text-[11px] text-muted-foreground">Historias editadas en los últimos 21 días</p>
            <div className="mt-4 flex h-24 items-end gap-1">
              {activity.map((v, i) => {
                const max = Math.max(1, ...activity);
                return (
                  <div
                    key={i}
                    title={`${v} historia(s)`}
                    className={cn('flex-1 rounded-full', i === activity.length - 1 ? 'bg-heart' : 'bg-[#d5dbe2]')}
                    style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Organizador de pacientes */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-2xl font-semibold tracking-tight">Mis pacientes</h2>
          <div className="flex gap-1 rounded-full bg-card/60 p-1">
            {(['activa', 'alta', 'archivada', 'todas'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'h-8 rounded-full px-3.5 text-xs font-medium transition',
                  filter === f ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f === 'todas' ? 'Todas' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="buscar"
              placeholder="Buscar por nombre, documento, dx..."
              className="rounded-full bg-card pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="soft-card h-48 animate-pulse" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <div className="soft-card flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {historias.length === 0 ? 'Todavía no tienes historias clínicas.' : 'No hay pacientes con ese filtro.'}
            </p>
            {historias.length === 0 && (
              <Button variant="accent" onClick={nueva}>
                Crear la primera historia
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((h) => {
              const pct = completionPercent(h.data);
              const dx = h.data?.diagnostico?.split('\n')[0] || h.data?.motivoConsulta;
              return (
                <div key={h.id} className="soft-card group relative flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Link to={`/historias/${h.id}`} className="absolute inset-0 rounded-2xl" aria-label={`Abrir ${h.patientName || 'historia'}`} />
                  <div className="flex items-start gap-3">
                    <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarTone(h.id))}>
                      {initials(h.patientName || '?')}
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate font-semibold">{h.patientName || 'Paciente sin nombre'}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[h.documento, patientMeta(h)].filter(Boolean).join(' · ') || 'Completa la identificación'}
                      </p>
                    </div>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="secondary" className="relative z-10" aria-label="Opciones">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {h.status !== 'activa' && (
                          <DropdownMenuItem onSelect={() => changeStatus(h.id, 'activa', h.patientName)}>
                            <RotateCcw /> Marcar activa
                          </DropdownMenuItem>
                        )}
                        {h.status !== 'alta' && (
                          <DropdownMenuItem onSelect={() => changeStatus(h.id, 'alta', h.patientName)}>
                            <CheckCircle2 /> Dar de alta
                          </DropdownMenuItem>
                        )}
                        {h.status !== 'archivada' && (
                          <DropdownMenuItem onSelect={() => changeStatus(h.id, 'archivada', h.patientName)}>
                            <Archive /> Archivar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={async () => {
                            const ok = await confirm({
                              title: `¿Eliminar la historia de ${h.patientName || 'este paciente'}?`,
                              description: 'Se borrarán también todas sus páginas de revisión y notas. No se puede deshacer.',
                              icon: Trash2,
                            });
                            if (ok) remove.mutate(h.id);
                          }}
                        >
                          <Trash2 /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mt-4 line-clamp-2 min-h-10 text-sm text-foreground/80">
                    {dx || <span className="text-muted-foreground">Sin motivo de consulta ni diagnóstico aún</span>}
                  </p>

                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>Historia completada</span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-good' : 'bg-heart')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant={h.status === 'activa' ? 'accent' : h.status === 'alta' ? 'good' : 'muted'}>
                      {STATUS_LABEL[h.status]}
                    </Badge>
                    {!!h.notasCount && (
                      <span className="flex items-center gap-1">
                        <NotebookPen className="size-3" /> {h.notasCount}
                      </span>
                    )}
                    <span className="ml-auto">{relativeTime(h.updatedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
