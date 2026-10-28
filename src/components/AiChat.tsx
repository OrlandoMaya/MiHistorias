import { ArrowUp, Copy, ListPlus, Loader2, Replace, Sparkles, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { streamAiChat, type ChatMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface AiChatProps {
  historiaId: string;
  mode: 'analisis' | 'diferenciales' | 'general';
  title: string;
  suggestions: string[];
  /** Se llama antes de enviar, para que la IA lea la versión guardada más reciente. */
  beforeSend?: () => Promise<void>;
  onInsert?: (text: string, how: 'append' | 'replace') => void;
  className?: string;
}

export function AiChat({ historiaId, mode, title, suggestions, beforeSend, onInsert, className }: AiChatProps) {
  const storageKey = `mihistorias.chat.${historiaId}.${mode}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* almacenamiento no disponible */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, storageKey]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const history: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await beforeSend?.();
      await streamAiChat(
        historiaId,
        mode,
        history,
        (chunk) =>
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          }),
        controller.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error((err as Error).message);
        // Quita la respuesta vacía para poder reintentar.
        setMessages((prev) => (prev[prev.length - 1]?.content ? prev : prev.slice(0, -2)));
        setInput(content);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className={cn('flex h-[560px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-info-soft/50 to-card', className)}>
      <div className="flex items-center gap-2 border-b bg-card/70 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-accent">
          <Sparkles className="size-4" />
        </span>
        <div className="mr-auto leading-tight">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[11px] text-muted-foreground">Lee toda la historia guardada</p>
        </div>
        {messages.length > 0 && (
          <Button size="icon-sm" variant="ghost" aria-label="Borrar conversación" onClick={() => setMessages([])} disabled={busy}>
            <Trash2 />
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Pregúntame sobre el caso. Uso los datos que ya llenaron en la historia.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border bg-card px-3 py-1.5 text-xs transition hover:border-ring hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[95%] rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 text-sm shadow-sm">
              {m.content ? (
                <div className="prose-chat">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {m.content && !(busy && i === messages.length - 1) && (
                <div className="mt-2 flex flex-wrap gap-1 border-t pt-2">
                  {onInsert && (
                    <>
                      <Button size="sm" variant="secondary" className="h-7" onClick={() => onInsert(m.content, 'append')}>
                        <ListPlus /> Insertar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => onInsert(m.content, 'replace')}>
                        <Replace /> Reemplazar
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    onClick={() => navigator.clipboard.writeText(m.content).then(() => toast.success('Copiado'))}
                  >
                    <Copy /> Copiar
                  </Button>
                </div>
              )}
            </div>
          ),
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Escribe tu pregunta..."
          className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none rounded-xl bg-secondary px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        {busy ? (
          <Button type="button" size="icon" variant="secondary" aria-label="Detener" onClick={() => abortRef.current?.abort()}>
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button type="submit" size="icon" variant="accent" aria-label="Enviar" disabled={!input.trim()}>
            <ArrowUp />
          </Button>
        )}
      </form>
    </div>
  );
}
