import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** `destructive` para borrar; `default` para acciones reversibles. */
  tone?: 'destructive' | 'default';
  icon?: LucideIcon;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Modal de confirmación global: `const ok = await confirm({ title: '...' })`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    resolver.current?.(false);
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  const destructive = (options?.tone ?? 'destructive') === 'destructive';
  const Icon = options?.icon ?? AlertTriangle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && close(false)}>
        <DialogContent className="max-w-sm gap-0 p-6 text-center">
          <span
            className={cn(
              'mx-auto flex size-14 items-center justify-center rounded-full',
              destructive ? 'bg-heart-soft text-heart' : 'bg-accent/60 text-foreground',
            )}
          >
            <Icon className="size-6" />
          </span>
          <DialogTitle className="mt-4 text-lg leading-snug">{options?.title}</DialogTitle>
          <DialogDescription className={cn('mt-2', !options?.description && 'sr-only')}>
            {options?.description ?? options?.title}
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => close(false)}>
              {options?.cancelText ?? 'Cancelar'}
            </Button>
            <Button variant={destructive ? 'destructive' : 'default'} onClick={() => close(true)} autoFocus>
              {options?.confirmText ?? (destructive ? 'Eliminar' : 'Confirmar')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm fuera de ConfirmProvider');
  return ctx;
}
