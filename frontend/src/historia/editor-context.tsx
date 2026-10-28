import { createContext, useContext } from 'react';
import { getIn } from '@/lib/utils';
import type { HistoriaData } from './types';

export type Updater<T> = T | ((prev: T | undefined) => T);

export interface EditorState {
  historiaId: string;
  data: HistoriaData;
  set: (path: string, value: Updater<any>) => void;
  /** Guarda inmediatamente los cambios pendientes (p. ej. antes de consultar a la IA). */
  saveNow: () => Promise<void>;
}

export const EditorContext = createContext<EditorState | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor fuera de EditorContext');
  return ctx;
}

/** Atajo para leer y escribir un valor de la historia por su ruta. */
export function useField<T = string>(path: string): [T | undefined, (value: Updater<T>) => void] {
  const { data, set } = useEditor();
  return [getIn(data, path) as T | undefined, (value: Updater<T>) => set(path, value)];
}
