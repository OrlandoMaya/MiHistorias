import { ArrowUpRight, Eye, EyeOff, HeartPulse, Loader2, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Logo } from '@/components/AppShell';
import { BodyFigure } from '@/components/BodyFigure';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

function IconField({
  id,
  label,
  icon: Icon,
  children,
  trailing,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
        {trailing && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  );
}

const inputCls = 'h-12 rounded-full border-transparent bg-card pl-11 shadow-[0_1px_2px_rgba(15,30,60,0.06)]';

/** Trazo tipo electrocardiograma para la tarjeta decorativa. */
const ECG = 'M0 30 L30 30 L36 26 L42 30 L52 30 L56 8 L61 46 L66 30 L80 30 L88 22 L96 30 L130 30 L136 26 L142 30 L152 30 L156 12 L161 44 L166 30 L180 30 L188 24 L196 30 L220 30';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fa] via-[#eef2f6] to-[#e3e9f0]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1fr_1.1fr]">
        {/* Formulario */}
        <div className="flex flex-col p-6 sm:p-10 lg:p-12">
          <Logo />

          <div className="mx-auto my-auto flex w-full max-w-[400px] flex-col py-10">
            <div className="mb-8 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'h-10 rounded-full text-sm font-medium transition',
                    mode === m ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>

            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-[2.75rem]">
              {isLogin ? 'Hola de nuevo' : 'Empecemos'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isLogin
                ? 'Entra para seguir con tus historias clínicas y revisiones.'
                : 'Crea tu cuenta. Cada compañera tiene la suya y ve solo sus propios pacientes.'}
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
              {!isLogin && (
                <IconField id="name" label="Nombre" icon={User}>
                  <Input
                    id="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    placeholder="Cómo te llamas"
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </IconField>
              )}
              <IconField id="email" label="Correo" icon={Mail}>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </IconField>
              <IconField
                id="password"
                label="Contraseña"
                icon={Lock}
                trailing={
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              >
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={isLogin ? undefined : 6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                  className={cn(inputCls, 'pr-12')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </IconField>

              <Button type="submit" variant="accent" size="lg" className="mt-3 h-14 justify-between pr-2 pl-7" disabled={busy}>
                {isLogin ? 'Iniciar sesión' : 'Crear mi cuenta'}
                <span className="flex size-10 items-center justify-center rounded-full bg-card">
                  {busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
                </span>
              </Button>
            </form>
          </div>

          <p className="text-xs text-muted-foreground">Apoyo académico para historias clínicas · MiHistorias</p>
        </div>

        {/* Panel visual */}
        <div className="relative hidden flex-col justify-center gap-4 p-10 lg:flex xl:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,rgba(255,255,255,0.4)_30%,transparent_60%)]" />

          <div className="relative grid grid-cols-[1.4fr_1fr] gap-3">
            <div className="soft-card p-4">
              <div className="flex items-center justify-between">
                <HeartPulse className="size-4 text-heart" />
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium">• Normal</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Presión arterial</p>
              <p className="text-2xl font-semibold">
                120<span className="text-sm font-normal text-muted-foreground">/ 80</span>
              </p>
              <svg viewBox="0 0 220 54" className="mt-2 h-11 w-full rounded-xl bg-shell" aria-hidden>
                <path d={ECG} fill="none" stroke="var(--heart)" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="soft-card flex flex-col p-4">
              <p className="text-xs text-muted-foreground">Secciones de la historia</p>
              <p className="text-2xl font-semibold">14</p>
              <div className="mt-auto flex gap-0.5">
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className={cn('h-6 flex-1 rounded-full', i < 10 ? 'bg-heart' : 'bg-[#d5dbe2]')} />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-good">• Autoguardado</p>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <BodyFigure
              className="max-w-[360px]"
              spots={[
                { key: 'a', label: 'Examen físico', x: 100, y: 40, side: 'right', labelY: 46, tone: 'good' },
                { key: 'b', label: 'Revisión por sistemas', x: 80, y: 122, side: 'left', labelY: 122, tone: 'heart' },
                { key: 'c', label: 'Análisis con IA', x: 104, y: 180, side: 'right', labelY: 196, tone: 'info' },
                { key: 'd', label: 'Paraclínicos', x: 80, y: 330, side: 'left', labelY: 318, tone: 'heart' },
              ]}
            />
          </div>

          <div className="soft-card relative flex items-center gap-3 p-3 pr-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-accent">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Asistente de análisis</p>
              <p className="truncate text-xs text-muted-foreground">Te ayuda a redactar el análisis y los diferenciales</p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] whitespace-nowrap text-primary-foreground">
              Propón diferenciales
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
