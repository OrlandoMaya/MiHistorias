import { BodyFigure, REGION_SPOTS } from '@/components/BodyFigure';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor } from '../editor-context';
import { ChipGroup, ChipSingle, FieldInput, FieldTextarea } from '../fields';
import { ESTADO_GENERAL, EXAMEN_REGIONES, SIGNOS_VITALES } from '../schema';
import { SectionCard, SubBlock } from '../SectionCard';
import type { SectionProps } from './BasicSections';

const num = (v?: string) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Interpretaciones rápidas de signos vitales en adultos. */
function vitalAlerts(s: Record<string, string> = {}) {
  const alerts: { label: string; tone: 'heart' | 'info' }[] = [];
  const pas = num(s.pas), pad = num(s.pad), fc = num(s.fc), fr = num(s.fr), t = num(s.temp), sat = num(s.sat);
  if (pas !== null && pas < 90) alerts.push({ label: 'Hipotensión', tone: 'heart' });
  if ((pas !== null && pas >= 140) || (pad !== null && pad >= 90)) alerts.push({ label: 'PA elevada', tone: 'heart' });
  if (fc !== null && fc > 100) alerts.push({ label: 'Taquicardia', tone: 'heart' });
  if (fc !== null && fc < 60) alerts.push({ label: 'Bradicardia', tone: 'info' });
  if (fr !== null && fr > 20) alerts.push({ label: 'Taquipnea', tone: 'heart' });
  if (t !== null && t >= 38) alerts.push({ label: 'Fiebre', tone: 'heart' });
  if (t !== null && t < 35) alerts.push({ label: 'Hipotermia', tone: 'info' });
  if (sat !== null && sat < 90) alerts.push({ label: 'Hipoxemia', tone: 'heart' });
  return alerts;
}

function Computed({ label, value, unit }: { label: string; value: string | null; unit: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex h-10 items-baseline gap-1 rounded-xl bg-accent/40 px-3.5 pt-2 text-sm font-semibold">
        {value ?? '—'} <span className="text-xs font-normal text-muted-foreground">{value ? unit : ''}</span>
      </div>
    </div>
  );
}

const GLASGOW = {
  O: [4, 3, 2, 1],
  V: [5, 4, 3, 2, 1],
  M: [6, 5, 4, 3, 2, 1],
};

export function ExamenFisicoSection(props: SectionProps) {
  const { data, set } = useEditor();
  const signos = data.examenFisico?.signos ?? {};
  const general = data.examenFisico?.general ?? {};
  const regiones = data.examenFisico?.regiones ?? {};

  const peso = num(signos.peso), talla = num(signos.talla), pas = num(signos.pas), pad = num(signos.pad);
  const imc = peso && talla ? (peso / (talla / 100) ** 2).toFixed(1) : null;
  const pam = pas && pad ? ((pas + 2 * pad) / 3).toFixed(0) : null;
  const glasgow = ['O', 'V', 'M'].every((k) => general[`glasgow${k}`])
    ? Number(general.glasgowO) + Number(general.glasgowV) + Number(general.glasgowM)
    : null;
  const alerts = vitalAlerts(signos);

  const regionTone = (key: string, anormal: string[]) => {
    const items = regiones[key]?.items ?? [];
    if (items.some((i) => anormal.includes(i))) return 'heart' as const;
    return items.length || regiones[key]?.notas ? ('good' as const) : ('none' as const);
  };

  return (
    <SectionCard {...props}>
      <SubBlock title="Signos vitales y antropometría">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {SIGNOS_VITALES.map((f) => (
            <FieldInput key={f.key} path={`examenFisico.signos.${f.key}`} def={f} />
          ))}
          <Computed label="PAM" value={pam} unit="mmHg" />
          <Computed label="IMC" value={imc} unit="kg/m²" />
          <Computed label="Glasgow" value={glasgow ? String(glasgow) : null} unit="/15" />
        </div>
        {alerts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {alerts.map((a) => (
              <Badge key={a.label} variant={a.tone}>
                {a.label}
              </Badge>
            ))}
          </div>
        )}
      </SubBlock>

      <SubBlock title="Estado general" className="mt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {(['aspecto', 'conciencia', 'hidratacion', 'coloracion'] as const).map((k) => (
            <div key={k} className="flex flex-col gap-2">
              <Label className="capitalize">{k === 'hidratacion' ? 'Hidratación' : k === 'coloracion' ? 'Coloración' : k}</Label>
              <ChipSingle path={`examenFisico.general.${k}`} options={ESTADO_GENERAL[k]} />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <Label>Orientado en</Label>
            <ChipGroup path="examenFisico.general.orientacion" options={ESTADO_GENERAL.orientacion} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Actitud / facies</Label>
            <ChipGroup path="examenFisico.general.actitud" options={ESTADO_GENERAL.actitud} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Escala de Glasgow</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GLASGOW) as (keyof typeof GLASGOW)[]).map((k) => (
                <Select
                  key={k}
                  value={general[`glasgow${k}`] ?? ''}
                  onValueChange={(v) => set(`examenFisico.general.glasgow${k}`, v)}
                >
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder={k === 'O' ? 'Ocular' : k === 'V' ? 'Verbal' : 'Motora'} />
                  </SelectTrigger>
                  <SelectContent>
                    {GLASGOW[k].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {k}
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Dolor (EVA): {general.eva ?? '—'}/10</Label>
            <input
              type="range"
              min={0}
              max={10}
              value={general.eva ?? 0}
              onChange={(e) => set('examenFisico.general.eva', e.target.value)}
              className="h-10 accent-[var(--heart)]"
            />
          </div>
        </div>
        <FieldTextarea path="examenFisico.general.notas" label="Descripción" rows={2} className="mt-4" />
      </SubBlock>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(280px,380px)_1fr]">
        <div className="no-print hidden xl:block">
          <div className="sticky top-28 rounded-2xl bg-gradient-to-b from-shell to-secondary p-4">
            <p className="mb-1 text-center text-xs text-muted-foreground">Toca una región para ir a ella</p>
            <BodyFigure
              spots={REGION_SPOTS.map((spot) => {
                const region = EXAMEN_REGIONES.find((r) => r.key === spot.key)!;
                return {
                  ...spot,
                  label: region.title,
                  tone: regionTone(region.key, region.anormal),
                  onClick: () =>
                    document.getElementById(`region-${region.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                };
              })}
            />
            <div className="mt-2 flex justify-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-good" /> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-heart" /> Hallazgo anormal
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {EXAMEN_REGIONES.map((r) => (
            <div key={r.key} id={`region-${r.key}`} className="scroll-mt-32">
              <SubBlock title={r.title}>
                <p className="mb-1.5 text-[11px] font-medium text-good">Normal</p>
                <ChipGroup path={`examenFisico.regiones.${r.key}.items`} options={r.normal} tone="good" />
                <p className="mt-3 mb-1.5 text-[11px] font-medium text-heart">Anormal</p>
                <ChipGroup path={`examenFisico.regiones.${r.key}.items`} options={r.anormal} tone="heart" />
                <FieldTextarea
                  path={`examenFisico.regiones.${r.key}.notas`}
                  rows={2}
                  placeholder="Descripción, localización, características..."
                  className="mt-3 [&_textarea]:bg-card"
                />
              </SubBlock>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
