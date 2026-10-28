import { cn } from '@/lib/utils';

export interface BodySpot {
  key: string;
  label: string;
  /** Coordenadas sobre la figura (0-200 de ancho, 0-440 de alto). */
  x: number;
  y: number;
  side: 'left' | 'right';
  /** Altura a la que se dibuja la etiqueta. */
  labelY: number;
  tone?: 'none' | 'good' | 'heart' | 'info';
  onClick?: () => void;
}

const VB_W = 360;
const VB_H = 440;
const OFFSET = 80;
const ANCHOR = { left: 58, right: 302 };

const dotFill = { none: '#ffffff', good: 'var(--good)', heart: 'var(--heart)', info: 'var(--info)' };

/** Figura humana estilizada con etiquetas clicables por región (inspirada en un atlas anatómico). */
export function BodyFigure({ spots, className }: { spots: BodySpot[]; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[420px] select-none', className)} style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6c4b4" />
            <stop offset="55%" stopColor="#e88f78" />
            <stop offset="100%" stopColor="#c9604c" />
          </linearGradient>
          <linearGradient id="skinShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#7a2a1f" stopOpacity="0.18" />
          </linearGradient>
          <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#0f1419" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0f1419" stopOpacity="0" />
          </radialGradient>
          <g id="arm">
            <path d="M54 96 Q38 100 36 122 L30 180 Q29 191 38 192 Q46 193 47 182 L58 126 Z" />
            <path d="M31 184 L25 240 Q24 250 31 252 Q39 253 40 243 L47 188 Z" />
            <ellipse cx="30" cy="263" rx="7.5" ry="13" />
          </g>
          <g id="leg">
            <path d="M64 248 Q58 300 65 340 L69 408 Q70 419 79 419 Q87 419 87 408 L92 340 Q99 300 99 266 Z" />
            <ellipse cx="80" cy="425" rx="13" ry="6" />
          </g>
        </defs>

        <ellipse cx={VB_W / 2} cy="430" rx="80" ry="9" fill="url(#floor)" />

        <g transform={`translate(${OFFSET} 0)`}>
          <g fill="url(#skin)">
            <ellipse cx="100" cy="38" rx="21" ry="26" />
            <path d="M88 56 L112 56 L115 84 L85 84 Z" />
            <path d="M58 90 Q100 76 142 90 Q151 95 151 110 L143 170 Q136 200 139 228 L61 228 Q64 200 57 170 L49 110 Q49 95 58 90 Z" />
            <path d="M61 220 L139 220 Q144 250 129 264 L100 274 L71 264 Q56 250 61 220 Z" />
            <use href="#arm" />
            <use href="#arm" transform="translate(200 0) scale(-1 1)" />
            <use href="#leg" />
            <use href="#leg" transform="translate(200 0) scale(-1 1)" />
          </g>
          <g fill="url(#skinShade)">
            <path d="M58 90 Q100 76 142 90 Q151 95 151 110 L143 170 Q136 200 139 228 L61 228 Q64 200 57 170 L49 110 Q49 95 58 90 Z" />
          </g>
          <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <path d="M100 92 L100 226" />
            <path d="M62 110 Q80 132 100 120 Q120 132 138 110" />
            <path d="M84 150 L116 150 M84 172 L116 172 M85 194 L115 194" />
            <path d="M70 226 Q100 250 130 226" />
            <path d="M74 336 Q80 342 86 336 M114 336 Q120 342 126 336" />
            <path d="M92 40 Q100 44 108 40" strokeOpacity="0.3" />
          </g>
        </g>

        {spots.map((s) => {
          const px = s.x + OFFSET;
          const ax = ANCHOR[s.side];
          return (
            <g key={s.key}>
              <path
                d={`M${px} ${s.y} L${px + (s.side === 'left' ? -14 : 14)} ${s.labelY} L${ax} ${s.labelY}`}
                stroke="#0f1419"
                strokeOpacity="0.25"
                strokeWidth="1"
                fill="none"
              />
              <circle cx={px} cy={s.y} r="7" fill="#ffffff" fillOpacity="0.55" />
              <circle cx={px} cy={s.y} r="4" fill={dotFill[s.tone ?? 'none']} stroke="#0f1419" strokeOpacity="0.15" />
            </g>
          );
        })}
      </svg>

      {spots.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={s.onClick}
          disabled={!s.onClick}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium whitespace-nowrap shadow-sm transition hover:shadow-md disabled:cursor-default"
          style={{ left: `${(ANCHOR[s.side] / VB_W) * 100}%`, top: `${(s.labelY / VB_H) * 100}%` }}
        >
          <span className="size-1.5 rounded-full" style={{ background: s.tone && s.tone !== 'none' ? dotFill[s.tone] : '#0f1419' }} />
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** Posiciones de cada región del examen físico sobre la figura. */
export const REGION_SPOTS: Omit<BodySpot, 'label'>[] = [
  { key: 'neurologico', x: 100, y: 20, side: 'right', labelY: 22 },
  { key: 'cabezaCuello', x: 100, y: 70, side: 'left', labelY: 58 },
  { key: 'torax', x: 78, y: 118, side: 'left', labelY: 118 },
  { key: 'cardiovascular', x: 114, y: 124, side: 'right', labelY: 100 },
  { key: 'abdomen', x: 100, y: 182, side: 'right', labelY: 178 },
  { key: 'piel', x: 36, y: 200, side: 'left', labelY: 196 },
  { key: 'genitourinario', x: 100, y: 248, side: 'left', labelY: 262 },
  { key: 'extremidades', x: 120, y: 330, side: 'right', labelY: 330 },
];
