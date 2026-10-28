import type { ReactNode } from 'react';

/** Medidor semicircular de marcas, como el de frecuencia cardiaca del diseño de referencia. */
export function Gauge({ value, center, size = 220 }: { value: number; center?: ReactNode; size?: number }) {
  const ticks = 34;
  const active = Math.round((Math.max(0, Math.min(100, value)) / 100) * ticks);
  const r1 = 86;
  const r2 = 104;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.6 }}>
      <svg viewBox="0 0 220 132" className="size-full" aria-hidden>
        {Array.from({ length: ticks }, (_, i) => {
          const angle = Math.PI - (i / (ticks - 1)) * Math.PI;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const on = i < active;
          const t = i / (ticks - 1);
          return (
            <line
              key={i}
              x1={110 + r1 * cos}
              y1={118 - r1 * sin}
              x2={110 + r2 * cos}
              y2={118 - r2 * sin}
              strokeWidth="5.5"
              strokeLinecap="round"
              stroke={on ? `color-mix(in oklab, var(--heart) ${35 + t * 65}%, #ffd6dd)` : '#e9edf2'}
            />
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">{center}</div>
    </div>
  );
}
