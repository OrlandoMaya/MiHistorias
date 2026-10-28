import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, CheckCircle2, RotateCcw, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm';
import { api, type Historia, type HistoriaStatus } from '@/lib/api';

export function useHistorias() {
  return useQuery({ queryKey: ['historias'], queryFn: () => api<Historia[]>('/historias') });
}

export function useCreateHistoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<Historia>('/historias', {
        method: 'POST',
        json: { data: { identificacion: { fechaIngreso: new Date().toISOString().slice(0, 10) } } },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['historias'] }),
    onError: (e) => toast.error(e.message),
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: HistoriaStatus }) =>
      api<Historia>(`/historias/${id}`, { method: 'PATCH', json: { status } }),
    onSuccess: (h) => {
      qc.invalidateQueries({ queryKey: ['historias'] });
      qc.setQueryData(['historia', h.id], h);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteHistoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/historias/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historias'] });
      toast.success('Historia eliminada');
    },
    onError: (e) => toast.error(e.message),
  });
}

const STATUS_CONFIRM: Record<HistoriaStatus, { title: string; description: string; confirmText: string; icon: LucideIcon }> = {
  activa: {
    title: '¿Reactivar la historia de {nombre}?',
    description: 'Volverá a aparecer en la lista de pacientes activos.',
    confirmText: 'Reactivar',
    icon: RotateCcw,
  },
  alta: {
    title: '¿Dar de alta a {nombre}?',
    description: 'La historia pasará a «De alta». Puedes reactivarla cuando quieras.',
    confirmText: 'Dar de alta',
    icon: CheckCircle2,
  },
  archivada: {
    title: '¿Archivar la historia de {nombre}?',
    description: 'Dejará de verse entre los activos, pero no se borra nada.',
    confirmText: 'Archivar',
    icon: Archive,
  },
};

/** Cambia el estado de una historia pidiendo confirmación antes. */
export function useConfirmedStatus() {
  const confirm = useConfirm();
  const setStatus = useSetStatus();
  return async (id: string, status: HistoriaStatus, nombre: string) => {
    const c = STATUS_CONFIRM[status];
    const ok = await confirm({ ...c, title: c.title.replace('{nombre}', nombre || 'este paciente'), tone: 'default' });
    if (ok) setStatus.mutate({ id, status });
  };
}

export const STATUS_LABEL: Record<HistoriaStatus, string> = {
  activa: 'Activa',
  alta: 'De alta',
  archivada: 'Archivada',
};
