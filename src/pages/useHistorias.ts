import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export const STATUS_LABEL: Record<HistoriaStatus, string> = {
  activa: 'Activa',
  alta: 'De alta',
  archivada: 'Archivada',
};
