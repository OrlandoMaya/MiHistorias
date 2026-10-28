import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  return crypto.randomUUID();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Edad en años a partir de una fecha ISO (yyyy-mm-dd). */
export function ageFrom(dateIso?: string): number | null {
  if (!dateIso) return null;
  const birth = new Date(dateIso + 'T00:00:00');
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  if (diff < 86400 * 30) return rtf.format(-Math.round(diff / 86400), 'day');
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Lee un valor anidado usando una ruta con puntos: "examenFisico.signos.fc". */
export function getIn(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/** Devuelve una copia del objeto con el valor reemplazado en la ruta indicada. */
export function setIn<T extends Record<string, any>>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  const current = obj ?? {};
  return {
    ...current,
    [head]: rest.length ? setIn(current[head] ?? {}, rest.join('.'), value) : value,
  } as T;
}
