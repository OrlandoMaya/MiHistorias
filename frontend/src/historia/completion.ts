import { SECTIONS } from './schema';
import type { HistoriaData } from './types';

/** true si el valor contiene algo escrito o marcado en cualquier nivel. */
function hasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.some(hasContent);
  if (typeof value === 'object') {
    return Object.entries(value).some(([k, v]) => k !== 'id' && hasContent(v));
  }
  return false;
}

export function sectionStatus(data: HistoriaData): Record<string, boolean> {
  return {
    identificacion: !!(data.identificacion?.nombre?.trim() && data.identificacion?.documento?.trim()),
    motivo: hasContent(data.motivoConsulta),
    enfermedad: hasContent(data.enfermedadActual),
    antecedentes: hasContent(data.antecedentes),
    rxs: hasContent(data.revisionSistemas),
    examen: hasContent(data.examenFisico?.signos) && hasContent(data.examenFisico?.regiones),
    paraclinicos: !!data.paraclinicos?.some((t) => t.filas.some((f) => f.resultado?.trim())),
    imagenes: !!data.imagenes?.some((e) => e.reporte?.trim() || e.interpretacion?.trim() || e.archivos?.length),
    analisis: hasContent(data.analisis),
    dxEtio: hasContent(data.dxEtiologico) || hasContent(data.dxSindromatico),
    diferenciales: hasContent(data.dxDiferenciales),
    problemas: hasContent(data.problemas?.map((p) => p.texto)),
    diagnostico: hasContent(data.diagnostico),
    plan: hasContent(data.plan),
  };
}

export function completionPercent(data: HistoriaData) {
  const status = sectionStatus(data ?? {});
  const done = SECTIONS.filter((s) => status[s.id]).length;
  return Math.round((done / SECTIONS.length) * 100);
}
