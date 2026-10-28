import { ChevronDown, LayoutGrid, LogOut, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useConfirm } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { initials } from '@/lib/utils';
import { useCreateHistoria } from '@/pages/useHistorias';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="relative flex size-8 items-center justify-center rounded-[10px] bg-primary">
        <span className="absolute h-4 w-1 rounded-full bg-accent" />
        <span className="absolute h-1 w-4 rounded-full bg-accent" />
      </span>
      MiHistorias
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const create = useCreateHistoria();
  const confirm = useConfirm();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f7fa] to-[#e9eef3]">
      <header className="no-print sticky top-0 z-40 bg-[#f4f7fa]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-4 sm:px-8">
          <Logo />
          <nav className="mx-auto hidden items-center gap-2 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${isActive ? 'bg-card shadow-sm' : 'text-muted-foreground hover:bg-card/70'}`
              }
            >
              <LayoutGrid className="size-4" /> Pacientes
            </NavLink>
          </nav>
          <Button
            variant="white"
            className="ml-auto md:ml-0"
            disabled={create.isPending}
            onClick={() => create.mutate(undefined, { onSuccess: (h) => navigate(`/historias/${h.id}`) })}
          >
            <Plus /> <span className="hidden sm:inline">Nueva historia</span>
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-card/70">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold">
                {initials(user!.name)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">{user!.name}</span>
                <span className="block text-[11px] text-muted-foreground">{user!.email}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sesión iniciada como {user!.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={async () => {
                  const ok = await confirm({
                    title: '¿Cerrar sesión?',
                    description: 'Tus historias quedan guardadas. Podrás volver a entrar con tu correo y contraseña.',
                    confirmText: 'Cerrar sesión',
                    tone: 'default',
                    icon: LogOut,
                  });
                  if (ok) logout();
                }}
              >
                <LogOut /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 pt-2 pb-10 sm:px-8">{children}</main>
    </div>
  );
}
