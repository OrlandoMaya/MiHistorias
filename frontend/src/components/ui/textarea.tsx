import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content flex min-h-24 w-full rounded-xl border border-input bg-secondary/60 px-3.5 py-2.5 text-sm leading-relaxed transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:bg-card focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
