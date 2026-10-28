import { CalendarDays, Plus, Table2, Trash2, X } from 'lucide-react';
import { useConfirm } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { uid } from '@/lib/utils';
import { useField } from '../editor-context';
import { FieldTextarea } from '../fields';
import { PARACLINICOS_PRESETS } from '../schema';
import { SectionCard } from '../SectionCard';
import type { ParaclinicoFila, ParaclinicoTabla } from '../types';
import type { SectionProps } from './BasicSections';

const today = () => new Date().toISOString().slice(0, 10);
const emptyRow = (): ParaclinicoFila => ({ id: uid(), examen: '', resultado: '', unidad: '', referencia: '' });

export function ParaclinicosSection(props: SectionProps) {
  const [tablas = [], setTablas] = useField<ParaclinicoTabla[]>('paraclinicos');
  const confirm = useConfirm();

  const updateTabla = (id: string, patch: Partial<ParaclinicoTabla>) =>
    setTablas(tablas.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addTabla = () =>
    setTablas([...tablas, { id: uid(), fecha: today(), titulo: '', filas: [emptyRow()], interpretacion: '' }]);

  const addPreset = (tabla: ParaclinicoTabla, preset: string) => {
    const filas = tabla.filas.filter((f) => f.examen || f.resultado);
    const nuevas = PARACLINICOS_PRESETS[preset].map(([examen, unidad, referencia]) => ({
      id: uid(),
      examen,
      resultado: '',
      unidad,
      referencia,
    }));
    updateTabla(tabla.id, { filas: [...filas, ...nuevas], titulo: tabla.titulo || preset });
  };

  return (
    <SectionCard {...props}>
      <div className="flex flex-col gap-5">
        {tablas.map((tabla) => {
          const setFila = (filaId: string, patch: Partial<ParaclinicoFila>) =>
            updateTabla(tabla.id, { filas: tabla.filas.map((f) => (f.id === filaId ? { ...f, ...patch } : f)) });
          return (
            <div key={tabla.id} className="overflow-hidden rounded-2xl border bg-shell/60">
              <div className="flex flex-wrap items-center gap-2 border-b bg-card/70 p-3">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-9 w-44 bg-card pl-9"
                    value={tabla.fecha}
                    onChange={(e) => updateTabla(tabla.id, { fecha: e.target.value })}
                  />
                </div>
                <Input
                  className="h-9 min-w-40 flex-1 bg-card"
                  placeholder="Título (ej. Ingreso, Control día 2)"
                  value={tabla.titulo}
                  onChange={(e) => updateTabla(tabla.id, { titulo: e.target.value })}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Table2 /> Plantillas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Agregar filas de...</DropdownMenuLabel>
                    {Object.keys(PARACLINICOS_PRESETS).map((p) => (
                      <DropdownMenuItem key={p} onSelect={() => addPreset(tabla, p)}>
                        {p}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Eliminar tabla"
                  onClick={async () => {
                    const ok = await confirm({
                      title: `¿Eliminar la tabla «${tabla.titulo || 'Paraclínicos'}»?`,
                      description: `Se borrarán sus ${tabla.filas.length} filas y la interpretación.`,
                      icon: Trash2,
                    });
                    if (ok) setTablas((prev = []) => prev.filter((t) => t.id !== tabla.id));
                  }}
                >
                  <Trash2 />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Examen</th>
                      <th className="px-3 py-2 font-medium">Resultado</th>
                      <th className="px-3 py-2 font-medium">Unidad</th>
                      <th className="px-3 py-2 font-medium">Referencia</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.filas.map((fila) => (
                      <tr key={fila.id} className="border-t border-border/70">
                        {(['examen', 'resultado', 'unidad', 'referencia'] as const).map((k) => (
                          <td key={k} className="px-1.5 py-1">
                            <input
                              className="h-8 w-full rounded-lg bg-transparent px-2 outline-none focus:bg-card focus:ring-2 focus:ring-ring/40 data-[k=resultado]:font-semibold"
                              data-k={k}
                              value={fila[k]}
                              onChange={(e) => setFila(fila.id, { [k]: e.target.value })}
                            />
                          </td>
                        ))}
                        <td className="pr-2">
                          <button
                            type="button"
                            aria-label="Quitar fila"
                            className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                            onClick={() => updateTabla(tabla.id, { filas: tabla.filas.filter((f) => f.id !== fila.id) })}
                          >
                            <X className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 pb-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateTabla(tabla.id, { filas: [...tabla.filas, emptyRow()] })}
                >
                  <Plus /> Fila
                </Button>
                <Textarea
                  className="mt-2 min-h-16 bg-card"
                  placeholder="Interpretación de estos resultados..."
                  value={tabla.interpretacion}
                  onChange={(e) => updateTabla(tabla.id, { interpretacion: e.target.value })}
                />
              </div>
            </div>
          );
        })}

        <Button variant="outline" className="self-start" onClick={addTabla}>
          <Plus /> Agregar tabla de paraclínicos
        </Button>

        <FieldTextarea
          path="paraclinicosInterpretacion"
          label="Interpretación general / evolución de los paraclínicos"
          rows={4}
          placeholder="Tendencias entre fechas, correlación con el cuadro clínico..."
        />
      </div>
    </SectionCard>
  );
}
