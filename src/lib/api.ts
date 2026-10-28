import type { HistoriaData } from '@/historia/types';

const TOKEN_KEY = 'mihistorias.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response) {
  let message = `Error ${res.status}`;
  try {
    const body = await res.json();
    message = Array.isArray(body.message) ? body.message.join('. ') : (body.message ?? message);
  } catch {
    /* respuesta sin JSON */
  }
  if (res.status === 401 && tokenStore.get()) onUnauthorized();
  return new ApiError(res.status, message);
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      ...authHeaders(),
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type HistoriaStatus = 'activa' | 'alta' | 'archivada';

export interface Historia {
  id: string;
  patientName: string;
  documento: string;
  status: HistoriaStatus;
  data: HistoriaData;
  createdAt: string;
  updatedAt: string;
  notasCount?: number;
}

export type NotaTipo = 'revision' | 'pregunta' | 'nota';

export interface Nota {
  id: string;
  historiaId: string;
  title: string;
  tipo: NotaTipo;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  url: string;
  name: string;
  mimetype: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', headers: authHeaders(), body });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Envía la conversación al asistente y va entregando el texto a medida que llega (SSE). */
export async function streamAiChat(
  historiaId: string,
  mode: 'analisis' | 'diferenciales' | 'general',
  messages: ChatMessage[],
  onText: (chunk: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch(`/api/historias/${historiaId}/ai/chat`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, messages }),
    signal,
  });
  if (!res.ok || !res.body) throw await parseError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const event of events) {
      const data = event.replace(/^data: /, '').trim();
      if (!data || data === '[DONE]') continue;
      const payload = JSON.parse(data);
      if (payload.error) throw new ApiError(502, payload.error);
      if (payload.text) onText(payload.text);
    }
  }
}
