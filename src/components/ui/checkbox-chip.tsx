import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'good' | 'heart';

const tones: Record<Tone, string> = {
  neutral: 'data-[on=true]:bg-primary data-[on=true]:text-primary-foreground data-[on=true]:border-primary',
  good: 'data-[on=true]:bg-good-soft data-[on=true]:text-good data-[on=true]:border-good/40',
  heart: 'data-[on=true]:bg-heart-soft data-[on=true]:text-heart data-[on=true]:border-heart/40',
};

/** Casilla con forma de chip: pensada para marcar síntomas y hallazgos rápido. */
export function CheckboxChip({
  label,
  checked,
  onChange,
  tone = 'neutral',
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-on={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all hover:border-ring active:scale-[0.97]',
        tones[tone],
      )}
    >
      <span
        className={cn(
          'flex size-3.5 items-center justify-center rounded-full border border-current/30 transition',
          checked && 'border-transparent bg-current/15',
        )}
      >
        {checked && <CheckIcon className="size-2.5" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
