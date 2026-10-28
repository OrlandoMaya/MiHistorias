import {
  Activity,
  BadgeCheck,
  Brain,
  ClipboardList,
  FlaskConical,
  GitCompareArrows,
  History,
  IdCard,
  ListChecks,
  ListTodo,
  MessageSquareQuote,
  Microscope,
  ScanLine,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

export interface SectionDef {
  id: string;
  title: string;
  icon: LucideIcon;
  ai?: boolean;
}

export const SECTIONS: SectionDef[] = [
  { id: 'identificacion', title: 'Identificación', icon: IdCard },
  { id: 'motivo', title: 'Motivo de consulta', icon: MessageSquareQuote },
  { id: 'enfermedad', title: 'Enfermedad actual', icon: Activity },
  { id: 'antecedentes', title: 'Antecedentes', icon: History },
  { id: 'rxs', title: 'Revisión por sistemas', icon: ListChecks },
  { id: 'examen', title: 'Examen físico', icon: Stethoscope },
  { id: 'paraclinicos', title: 'Paraclínicos', icon: FlaskConical },
  { id: 'imagenes', title: 'Imágenes', icon: ScanLine },
  { id: 'analisis', title: 'Análisis', icon: Brain, ai: true },
  { id: 'dxEtio', title: 'Dx etiológico y sindromático', icon: Microscope },
  { id: 'diferenciales', title: 'Dx diferenciales', icon: GitCompareArrows, ai: true },
  { id: 'problemas', title: 'Listado de problemas', icon: ListTodo },
  { id: 'diagnostico', title: 'Diagnóstico', icon: BadgeCheck },
  { id: 'plan', title: 'Plan de manejo', icon: ClipboardList },
];

export type FieldType = 'text' | 'date' | 'number' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
}

export const SEXO_OPTIONS = ['Femenino', 'Masculino', 'Intersexual'];

export const IDENTIFICACION_FIELDS: FieldDef[] = [
  { key: 'nombre', label: 'Nombre completo', placeholder: 'Nombres y apellidos' },
  { key: 'documento', label: 'Documento', placeholder: 'CC / TI / RC ...' },
  { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { key: 'edad', label: 'Edad', placeholder: 'Se calcula con la fecha' },
  { key: 'sexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
  { key: 'lugarNacimiento', label: 'Lugar de nacimiento' },
  { key: 'lugarResidencia', label: 'Lugar de residencia' },
  { key: 'ocupacion', label: 'Ocupación' },
  {
    key: 'escolaridad',
    label: 'Escolaridad',
    type: 'select',
    options: ['Ninguna', 'Primaria incompleta', 'Primaria completa', 'Bachillerato incompleto', 'Bachillerato completo', 'Técnico / Tecnólogo', 'Universitario', 'Posgrado'],
  },
  {
    key: 'estadoCivil',
    label: 'Estado civil',
    type: 'select',
    options: ['Soltero/a', 'Casado/a', 'Unión libre', 'Separado/a', 'Divorciado/a', 'Viudo/a'],
  },
  { key: 'religion', label: 'Religión' },
  {
    key: 'hemoclasificacion',
    label: 'Hemoclasificación',
    type: 'select',
    options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Desconocida'],
  },
  { key: 'conQuienVive', label: 'Con quién vive' },
  { key: 'informante', label: 'Informante', placeholder: 'Paciente / familiar ...' },
  { key: 'entrevistador', label: 'Entrevistador' },
  { key: 'fechaIngreso', label: 'Fecha de ingreso', type: 'date' },
];

export const ANTECEDENTES_FIELDS: FieldDef[] = [
  { key: 'patologicos', label: 'Patológicos', placeholder: 'HTA, DM2, ERC... con año de diagnóstico y control' },
  { key: 'farmacologicos', label: 'Farmacológicos', placeholder: 'Medicamento, dosis, frecuencia, adherencia' },
  { key: 'quirurgicos', label: 'Quirúrgicos', placeholder: 'Procedimiento, año, complicaciones' },
  { key: 'traumaticos', label: 'Traumáticos', placeholder: 'Fracturas, TEC, accidentes' },
  { key: 'toxicologicos', label: 'Toxicológicos', placeholder: 'Tabaco (paquetes/año), alcohol, SPA, exposición a humo de leña' },
  { key: 'inmunologicos', label: 'Inmunológicos', placeholder: 'Esquema de vacunación, COVID-19, influenza, neumococo' },
  { key: 'alergias', label: 'Alergias', placeholder: 'Medicamentos, alimentos, látex... y tipo de reacción' },
  { key: 'familiares', label: 'Familiares', placeholder: 'Parentesco y patología' },
];

export const GINECO_FIELDS: FieldDef[] = [
  { key: 'menarquia', label: 'Menarquia (edad)' },
  { key: 'ciclos', label: 'Ciclos', placeholder: 'Regulares 28x4' },
  { key: 'fum', label: 'FUM', type: 'date' },
  { key: 'g', label: 'G' },
  { key: 'p', label: 'P' },
  { key: 'a', label: 'A' },
  { key: 'c', label: 'C' },
  { key: 'v', label: 'V' },
  { key: 'e', label: 'E (ectópicos)' },
  { key: 'ivs', label: 'Inicio vida sexual' },
  { key: 'parejas', label: 'N.º parejas sexuales' },
  { key: 'planificacion', label: 'Planificación' },
  { key: 'citologia', label: 'Última citología / resultado' },
  { key: 'mamografia', label: 'Última mamografía' },
  { key: 'menopausia', label: 'Menopausia (edad)' },
  { key: 'its', label: 'ITS' },
];

export interface ChecklistGroup {
  key: string;
  title: string;
  items: string[];
}

export const REVISION_SISTEMAS: ChecklistGroup[] = [
  {
    key: 'general',
    title: 'Generales',
    items: ['Fiebre', 'Escalofríos', 'Astenia', 'Adinamia', 'Pérdida de peso', 'Ganancia de peso', 'Hiporexia', 'Diaforesis nocturna', 'Malestar general'],
  },
  {
    key: 'piel',
    title: 'Piel y faneras',
    items: ['Prurito', 'Erupciones', 'Lesiones nuevas', 'Cambios de coloración', 'Ictericia', 'Palidez', 'Caída del cabello', 'Cambios en uñas', 'Úlceras'],
  },
  {
    key: 'neurologico',
    title: 'Neurológico',
    items: ['Cefalea', 'Mareo', 'Vértigo', 'Síncope', 'Convulsiones', 'Parestesias', 'Debilidad focal', 'Alteración de la marcha', 'Temblor', 'Alteración de la memoria', 'Alteración del lenguaje'],
  },
  {
    key: 'sentidos',
    title: 'Órganos de los sentidos',
    items: ['Visión borrosa', 'Diplopía', 'Fotofobia', 'Ojo rojo', 'Otalgia', 'Hipoacusia', 'Tinnitus', 'Otorrea', 'Rinorrea', 'Epistaxis', 'Obstrucción nasal', 'Odinofagia', 'Disfonía'],
  },
  {
    key: 'cardiovascular',
    title: 'Cardiovascular',
    items: ['Dolor torácico', 'Palpitaciones', 'Disnea de esfuerzo', 'Ortopnea', 'Disnea paroxística nocturna', 'Edema de miembros inferiores', 'Claudicación intermitente', 'Cianosis'],
  },
  {
    key: 'respiratorio',
    title: 'Respiratorio',
    items: ['Tos', 'Expectoración', 'Hemoptisis', 'Disnea', 'Sibilancias', 'Dolor pleurítico', 'Ronquido / apneas'],
  },
  {
    key: 'gastrointestinal',
    title: 'Gastrointestinal',
    items: ['Náuseas', 'Vómito', 'Disfagia', 'Pirosis', 'Dolor abdominal', 'Distensión abdominal', 'Diarrea', 'Estreñimiento', 'Melenas', 'Hematoquecia', 'Hematemesis', 'Acolia', 'Coluria'],
  },
  {
    key: 'genitourinario',
    title: 'Genitourinario',
    items: ['Disuria', 'Polaquiuria', 'Urgencia urinaria', 'Nicturia', 'Hematuria', 'Incontinencia', 'Retención urinaria', 'Poliuria', 'Oliguria', 'Flujo vaginal / uretral', 'Sangrado genital anormal', 'Dolor lumbar'],
  },
  {
    key: 'musculoesqueletico',
    title: 'Musculoesquelético',
    items: ['Artralgias', 'Mialgias', 'Rigidez matutina', 'Edema articular', 'Limitación funcional', 'Lumbalgia', 'Calambres'],
  },
  {
    key: 'endocrino',
    title: 'Endocrino',
    items: ['Polidipsia', 'Polifagia', 'Intolerancia al frío', 'Intolerancia al calor', 'Cambios en la voz', 'Hirsutismo', 'Aumento de volumen en cuello'],
  },
  {
    key: 'hematologico',
    title: 'Hematológico y linfático',
    items: ['Equimosis', 'Petequias', 'Sangrado fácil', 'Adenopatías', 'Transfusiones previas'],
  },
  {
    key: 'psiquiatrico',
    title: 'Psiquiátrico',
    items: ['Ansiedad', 'Ánimo deprimido', 'Insomnio', 'Irritabilidad', 'Ideación suicida', 'Alucinaciones'],
  },
];

export const SIGNOS_VITALES: FieldDef[] = [
  { key: 'pas', label: 'PA sistólica', type: 'number', placeholder: 'mmHg' },
  { key: 'pad', label: 'PA diastólica', type: 'number', placeholder: 'mmHg' },
  { key: 'fc', label: 'FC', type: 'number', placeholder: 'lpm' },
  { key: 'fr', label: 'FR', type: 'number', placeholder: 'rpm' },
  { key: 'temp', label: 'Temperatura', type: 'number', placeholder: '°C' },
  { key: 'sat', label: 'SatO₂', type: 'number', placeholder: '%' },
  { key: 'fio2', label: 'FiO₂', type: 'number', placeholder: '%' },
  { key: 'glucometria', label: 'Glucometría', type: 'number', placeholder: 'mg/dL' },
  { key: 'peso', label: 'Peso', type: 'number', placeholder: 'kg' },
  { key: 'talla', label: 'Talla', type: 'number', placeholder: 'cm' },
  { key: 'perimetroAbdominal', label: 'Perímetro abdominal', type: 'number', placeholder: 'cm' },
];

export const ESTADO_GENERAL = {
  aspecto: ['Buen estado general', 'Regular estado general', 'Mal estado general'],
  conciencia: ['Alerta', 'Somnoliento', 'Obnubilado', 'Estuporoso', 'Comatoso'],
  orientacion: ['Tiempo', 'Espacio', 'Persona'],
  hidratacion: ['Hidratado', 'Deshidratación leve', 'Deshidratación moderada', 'Deshidratación severa'],
  coloracion: ['Normocoloreado', 'Pálido', 'Ictérico', 'Cianótico', 'Rubicundo'],
  actitud: ['Colaborador', 'Ansioso', 'Agitado', 'Postura antiálgica', 'Facies de dolor'],
};

export interface RegionDef {
  key: string;
  title: string;
  normal: string[];
  anormal: string[];
}

export const EXAMEN_REGIONES: RegionDef[] = [
  {
    key: 'cabezaCuello',
    title: 'Cabeza y cuello',
    normal: ['Normocéfalo', 'Pupilas isocóricas normorreactivas', 'Escleras anictéricas', 'Conjuntivas normocrómicas', 'Mucosa oral húmeda', 'Faringe sin alteraciones', 'Otoscopia normal', 'Cuello móvil', 'Tiroides no palpable', 'Sin adenopatías', 'Sin ingurgitación yugular'],
    anormal: ['Conjuntivas pálidas', 'Escleras ictéricas', 'Anisocoria', 'Mucosa oral seca', 'Faringe eritematosa', 'Exudado amigdalino', 'Adenopatías cervicales', 'Ingurgitación yugular', 'Bocio / nódulo tiroideo', 'Soplo carotídeo', 'Rigidez de nuca'],
  },
  {
    key: 'torax',
    title: 'Tórax y pulmones',
    normal: ['Tórax simétrico', 'Expansibilidad conservada', 'Murmullo vesicular conservado', 'Sin agregados pulmonares', 'Sin tirajes', 'Vibraciones vocales normales'],
    anormal: ['Tirajes intercostales', 'Uso de músculos accesorios', 'Hipoventilación', 'Crépitos', 'Roncus', 'Sibilancias', 'Matidez a la percusión', 'Hiperresonancia', 'Frote pleural', 'Soplo tubárico'],
  },
  {
    key: 'cardiovascular',
    title: 'Cardiovascular',
    normal: ['Ruidos cardiacos rítmicos', 'Sin soplos', 'Pulsos periféricos simétricos', 'Llenado capilar < 2 s', 'PMI en 5.º EII LMC'],
    anormal: ['Ruidos arrítmicos', 'Soplo sistólico', 'Soplo diastólico', 'S3', 'S4', 'Frote pericárdico', 'PMI desplazado', 'Pulsos disminuidos', 'Llenado capilar > 2 s'],
  },
  {
    key: 'abdomen',
    title: 'Abdomen',
    normal: ['Blando', 'Depresible', 'No doloroso a la palpación', 'Ruidos intestinales presentes', 'Sin masas ni megalias', 'Sin signos de irritación peritoneal'],
    anormal: ['Distendido', 'Doloroso a la palpación', 'Defensa', 'Signo de Blumberg', 'Signo de Murphy', 'Signo de McBurney', 'Hepatomegalia', 'Esplenomegalia', 'Ascitis / onda ascítica', 'Ruidos intestinales aumentados', 'Ruidos intestinales disminuidos', 'Masa palpable', 'Hernia'],
  },
  {
    key: 'genitourinario',
    title: 'Genitourinario',
    normal: ['Genitales externos normoconfigurados', 'Puño percusión negativa', 'Sin globo vesical', 'Diferido'],
    anormal: ['Puño percusión positiva', 'Globo vesical', 'Flujo / secreción', 'Lesiones genitales', 'Sangrado', 'Dolor a la movilización cervical', 'Masa escrotal / anexial'],
  },
  {
    key: 'piel',
    title: 'Piel y faneras',
    normal: ['Piel íntegra', 'Normotérmica', 'Sin lesiones', 'Faneras sin alteraciones'],
    anormal: ['Palidez mucocutánea', 'Ictericia', 'Cianosis', 'Petequias', 'Equimosis', 'Exantema', 'Úlceras / lesiones por presión', 'Lesiones cutáneas', 'Signos de deshidratación', 'Uñas en vidrio de reloj'],
  },
  {
    key: 'extremidades',
    title: 'Extremidades',
    normal: ['Eutróficas', 'Sin edemas', 'Pulsos distales presentes', 'Movilidad conservada', 'Sin deformidades'],
    anormal: ['Edema grado I', 'Edema grado II', 'Edema grado III', 'Edema grado IV', 'Signos de TVP', 'Pulsos distales disminuidos', 'Deformidad articular', 'Signos de inflamación articular', 'Várices', 'Acropaquias'],
  },
  {
    key: 'neurologico',
    title: 'Neurológico',
    normal: ['Alerta y orientado', 'Lenguaje coherente', 'Pares craneales sin alteraciones', 'Fuerza 5/5 en 4 extremidades', 'Sensibilidad conservada', 'Reflejos ++/++++', 'Coordinación conservada', 'Marcha normal', 'Sin signos meníngeos'],
    anormal: ['Desorientación', 'Afasia', 'Disartria', 'Alteración de pares craneales', 'Paresia', 'Plejia', 'Hipoestesia', 'Hiperreflexia', 'Hiporreflexia', 'Babinski positivo', 'Dismetría', 'Ataxia', 'Signos meníngeos positivos', 'Asterixis'],
  },
];

export const ESTUDIOS_IMAGEN = ['Radiografía', 'Ecografía', 'TAC', 'Resonancia', 'Electrocardiograma', 'Ecocardiograma', 'Endoscopia', 'Otro'];

export const PARACLINICOS_PRESETS: Record<string, [string, string, string][]> = {
  Hemograma: [
    ['Hemoglobina', 'g/dL', '12 - 16'],
    ['Hematocrito', '%', '36 - 48'],
    ['VCM', 'fL', '80 - 100'],
    ['HCM', 'pg', '27 - 33'],
    ['Leucocitos', '/mm³', '4.500 - 11.000'],
    ['Neutrófilos', '%', '40 - 70'],
    ['Linfocitos', '%', '20 - 40'],
    ['Plaquetas', '/mm³', '150.000 - 450.000'],
  ],
  'Función renal': [
    ['Creatinina', 'mg/dL', '0,6 - 1,2'],
    ['BUN', 'mg/dL', '7 - 20'],
    ['TFG (CKD-EPI)', 'mL/min/1,73m²', '> 90'],
  ],
  Electrolitos: [
    ['Sodio', 'mEq/L', '135 - 145'],
    ['Potasio', 'mEq/L', '3,5 - 5,0'],
    ['Cloro', 'mEq/L', '98 - 107'],
    ['Calcio', 'mg/dL', '8,5 - 10,5'],
    ['Magnesio', 'mg/dL', '1,7 - 2,2'],
  ],
  'Perfil hepático': [
    ['AST', 'U/L', '< 40'],
    ['ALT', 'U/L', '< 40'],
    ['Fosfatasa alcalina', 'U/L', '40 - 129'],
    ['GGT', 'U/L', '< 60'],
    ['Bilirrubina total', 'mg/dL', '0,3 - 1,2'],
    ['Bilirrubina directa', 'mg/dL', '< 0,3'],
    ['Albúmina', 'g/dL', '3,5 - 5,0'],
  ],
  Coagulación: [
    ['TP', 's', '11 - 13,5'],
    ['INR', '', '0,8 - 1,2'],
    ['TPT', 's', '25 - 35'],
  ],
  'Gases arteriales': [
    ['pH', '', '7,35 - 7,45'],
    ['PaCO₂', 'mmHg', '35 - 45'],
    ['PaO₂', 'mmHg', '80 - 100'],
    ['HCO₃', 'mEq/L', '22 - 26'],
    ['BE', 'mEq/L', '-2 a +2'],
    ['Lactato', 'mmol/L', '< 2'],
    ['PaFi', '', '> 300'],
  ],
  Uroanálisis: [
    ['Densidad', '', '1.005 - 1.030'],
    ['pH', '', '5 - 7'],
    ['Leucocitos', '/campo', '0 - 5'],
    ['Eritrocitos', '/campo', '0 - 3'],
    ['Nitritos', '', 'Negativo'],
    ['Proteínas', 'mg/dL', 'Negativo'],
    ['Bacterias', '', 'Escasas'],
  ],
  Inflamatorios: [
    ['PCR', 'mg/L', '< 5'],
    ['VSG', 'mm/h', '< 20'],
    ['Procalcitonina', 'ng/mL', '< 0,5'],
  ],
  Metabólico: [
    ['Glucosa', 'mg/dL', '70 - 100'],
    ['HbA1c', '%', '< 5,7'],
    ['Colesterol total', 'mg/dL', '< 200'],
    ['LDL', 'mg/dL', '< 100'],
    ['HDL', 'mg/dL', '> 40'],
    ['Triglicéridos', 'mg/dL', '< 150'],
    ['TSH', 'µUI/mL', '0,4 - 4,0'],
  ],
};

export const PLAN_FIELDS: FieldDef[] = [
  { key: 'hospitalizacion', label: 'Ubicación / hospitalización', placeholder: 'Hospitalizar en medicina interna, observación, UCI...' },
  { key: 'dieta', label: 'Dieta', placeholder: 'Nada vía oral, dieta hiposódica...' },
  { key: 'liquidos', label: 'Líquidos endovenosos', placeholder: 'SSN 0,9 % a 80 mL/h...' },
  { key: 'medicamentos', label: 'Medicamentos', placeholder: 'Nombre, dosis, vía, frecuencia' },
  { key: 'paraclinicos', label: 'Paraclínicos e imágenes solicitados' },
  { key: 'interconsultas', label: 'Interconsultas' },
  { key: 'cuidados', label: 'Cuidados de enfermería / monitoría', placeholder: 'Control de signos vitales, LA/LE, cabecera a 30°...' },
  { key: 'educacion', label: 'Educación y signos de alarma' },
  { key: 'otros', label: 'Otros' },
];
