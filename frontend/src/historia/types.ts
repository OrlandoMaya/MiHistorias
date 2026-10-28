import type { UploadedFile } from '@/lib/api';

export interface ChecklistBlock {
  items?: string[];
  notas?: string;
}

export interface ParaclinicoFila {
  id: string;
  examen: string;
  resultado: string;
  unidad: string;
  referencia: string;
}

export interface ParaclinicoTabla {
  id: string;
  fecha: string;
  titulo: string;
  filas: ParaclinicoFila[];
  interpretacion: string;
}

export interface ImagenEstudio {
  id: string;
  fecha: string;
  tipo: string;
  estudio: string;
  reporte: string;
  archivos: UploadedFile[];
  interpretacion: string;
}

export interface Problema {
  id: string;
  texto: string;
  estado: 'activo' | 'resuelto';
}

/** Todo el contenido de una historia se guarda como un único JSON en la base de datos. */
export interface HistoriaData {
  identificacion?: Record<string, string>;
  motivoConsulta?: string;
  enfermedadActual?: string;
  antecedentes?: Record<string, string> & { gineco?: Record<string, string> };
  revisionSistemas?: Record<string, ChecklistBlock>;
  examenFisico?: {
    signos?: Record<string, string>;
    general?: Record<string, any>;
    regiones?: Record<string, ChecklistBlock>;
  };
  paraclinicos?: ParaclinicoTabla[];
  paraclinicosInterpretacion?: string;
  imagenes?: ImagenEstudio[];
  analisis?: string;
  dxEtiologico?: string;
  dxSindromatico?: string;
  dxDiferenciales?: string;
  problemas?: Problema[];
  diagnostico?: string;
  plan?: Record<string, string>;
}
