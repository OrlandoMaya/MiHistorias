import { CheckCircle2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SectionDef } from './schema';

export function SectionCard({
  section,
  index,
  done,
  children,
  actions,
  className,
}: {
  section: SectionDef;
  index: number;
  done: boolean;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const Icon = section.icon;
  return (
    <section id={`sec-${section.id}`} className={cn('soft-card scroll-mt-28 p-5 sm:p-6', className)}>
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-[18px]" />
        </span>
        <div className="mr-auto">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Sección {index + 1}</p>
          <h2 className="text-lg font-semibold leading-tight">{section.title}</h2>
        </div>
        {section.ai && (
          <Badge variant="info">
            <Sparkles /> Con IA
          </Badge>
        )}
        {done ? (
          <Badge variant="good">
            <CheckCircle2 /> Completa
          </Badge>
        ) : (
          <Badge variant="muted">Pendiente</Badge>
        )}
        {actions}
      </header>
      {children}
    </section>
  );
}

export function SubBlock({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-dashed bg-shell/60 p-4', className)}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
