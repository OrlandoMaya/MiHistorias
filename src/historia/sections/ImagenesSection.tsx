import { FileText, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/lib/api';
import { uid } from '@/lib/utils';
import { useField } from '../editor-context';
import { ESTUDIOS_IMAGEN } from '../schema';
import { SectionCard } from '../SectionCard';
import type { ImagenEstudio } from '../types';
import type { SectionProps } from './BasicSections';

export function ImagenesSection(props: SectionProps) {
  const [estudios = [], setEstudios] = useField<ImagenEstudio[]>('imagenes');
  const [uploading, setUploading] = useState<string | null>(null);
  const confirm = useConfirm();

  const update = (id: string, patch: Partial<ImagenEstudio>) =>
    setEstudios(estudios.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const onFiles = async (estudio: ImagenEstudio, files: FileList | null) => {
    if (!files?.length) return;
    setUploading(estudio.id);
    try {
      const subidos = await Promise.all(Array.from(files).map(uploadFile));
      // Actualización funcional: durante la subida pudieron cambiar otros campos.
      setEstudios((prev = []) =>
        prev.map((e) => (e.id === estudio.id ? { ...e, archivos: [...(e.archivos ?? []), ...subidos] } : e)),
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <SectionCard {...props}>
      <div className="grid gap-4 lg:grid-cols-2">
        {estudios.map((estudio) => (
          <div key={estudio.id} className="flex flex-col gap-3 rounded-2xl border bg-shell/60 p-4">
            <div className="flex gap-2">
              <Select value={estudio.tipo} onValueChange={(tipo) => update(estudio.id, { tipo })}>
                <SelectTrigger className="h-9 w-40 bg-card">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ESTUDIOS_IMAGEN.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="h-9 w-40 bg-card"
                value={estudio.fecha}
                onChange={(e) => update(estudio.id, { fecha: e.target.value })}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                className="ml-auto"
                aria-label="Eliminar estudio"
                onClick={async () => {
                  const ok = await confirm({
                    title: `¿Eliminar el estudio${estudio.estudio ? ` «${estudio.estudio}»` : ''}?`,
                    description: 'Se borrarán el reporte, la interpretación y los archivos adjuntos.',
                    icon: Trash2,
                  });
                  if (ok) setEstudios((prev = []) => prev.filter((e) => e.id !== estudio.id));
                }}
              >
                <Trash2 />
              </Button>
            </div>
            <Input
              className="h-9 bg-card"
              placeholder="Estudio (ej. Rx de tórax PA y lateral)"
              value={estudio.estudio}
              onChange={(e) => update(estudio.id, { estudio: e.target.value })}
            />

            <div className="flex flex-wrap gap-2">
              {(estudio.archivos ?? []).map((a) => (
                <div key={a.url} className="group relative size-24 overflow-hidden rounded-xl border bg-card">
                  <a href={a.url} target="_blank" rel="noreferrer" title={a.name}>
                    {a.mimetype.startsWith('image/') ? (
                      <img src={a.url} alt={a.name} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-[10px] text-muted-foreground">
                        <FileText className="size-6" />
                        <span className="line-clamp-2">{a.name}</span>
                      </div>
                    )}
                  </a>
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    className="absolute top-1 right-1 rounded-full bg-card/90 p-0.5 opacity-0 shadow transition group-hover:opacity-100"
                    onClick={async () => {
                      const ok = await confirm({ title: `¿Quitar «${a.name}»?`, description: 'El archivo dejará de estar adjunto a este estudio.', confirmText: 'Quitar', icon: Trash2 });
                      if (ok) update(estudio.id, { archivos: estudio.archivos.filter((x) => x.url !== a.url) });
                    }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed bg-card text-[11px] text-muted-foreground transition hover:border-ring hover:text-foreground">
                {uploading === estudio.id ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                Subir
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    onFiles(estudio, e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Reporte / descripción</Label>
              <Textarea
                className="min-h-16 bg-card"
                placeholder="Lo que dice el informe del radiólogo o lo que se observa"
                value={estudio.reporte}
                onChange={(e) => update(estudio.id, { reporte: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Interpretación</Label>
              <Textarea
                className="min-h-16 bg-card"
                placeholder="Nuestra interpretación y correlación clínica"
                value={estudio.interpretacion}
                onChange={(e) => update(estudio.id, { interpretacion: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() =>
          setEstudios([
            ...estudios,
            {
              id: uid(),
              fecha: new Date().toISOString().slice(0, 10),
              tipo: '',
              estudio: '',
              reporte: '',
              archivos: [],
              interpretacion: '',
            },
          ])
        }
      >
        <Plus /> Agregar estudio de imagen
      </Button>
    </SectionCard>
  );
}
