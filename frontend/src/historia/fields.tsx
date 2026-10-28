import type { ReactNode } from 'react';
import { CheckboxChip } from '@/components/ui/checkbox-chip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useField } from './editor-context';
import type { FieldDef } from './schema';

export function FieldInput({ path, def, className }: { path: string; def: FieldDef; className?: string }) {
  const [value, setValue] = useField<string>(path);
  const id = path.replace(/\./g, '-');
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{def.label}</Label>
      {def.type === 'select' ? (
        <Select value={value ?? ''} onValueChange={setValue}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {def.options!.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={def.type === 'date' ? 'date' : 'text'}
          inputMode={def.type === 'number' ? 'decimal' : undefined}
          placeholder={def.placeholder}
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </div>
  );
}

export function FieldTextarea({
  path,
  label,
  placeholder,
  rows = 4,
  className,
  hint,
}: {
  path: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  hint?: ReactNode;
}) {
  const [value, setValue] = useField<string>(path);
  const id = path.replace(/\./g, '-');
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
        style={{ minHeight: `${rows * 1.6 + 1.2}rem` }}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Lista de chips que guarda un arreglo con las opciones marcadas. */
export function ChipGroup({
  path,
  options,
  tone,
}: {
  path: string;
  options: string[];
  tone?: 'neutral' | 'good' | 'heart';
}) {
  const [value, setValue] = useField<string[]>(path);
  const selected = value ?? [];
  const toggle = (option: string, on: boolean) =>
    setValue(on ? [...selected, option] : selected.filter((s) => s !== option));
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <CheckboxChip key={o} label={o} tone={tone} checked={selected.includes(o)} onChange={(on) => toggle(o, on)} />
      ))}
    </div>
  );
}

/** Igual que ChipGroup pero permite elegir una sola opción (o ninguna). */
export function ChipSingle({ path, options }: { path: string; options: string[] }) {
  const [value, setValue] = useField<string>(path);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <CheckboxChip key={o} label={o} checked={value === o} onChange={(on) => setValue(on ? o : '')} />
      ))}
    </div>
  );
}
