// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { useState } from 'react';
import { SEASON_DAYS, SEASON_LENGTH, monthlyStress } from '../engine/engine.js';
import { dateOfDay } from '../engine/content.js';
import { ROTATION_COLORS } from '../lib/colors.js';

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
const WET = '#cfe3d4'; const DRY_RICE = '#9fc7ad';
const BARE = 'repeating-linear-gradient(45deg, #f5f1ea 0 6px, #d9d0c1 6px 9px)';
const cols = { gridTemplateColumns: '7rem repeat(12, minmax(0, 1fr))' };

// Season day (0 = Dec 1) -> position along the Jun..May axis, in months.
function pos(d) {
  if (d >= SEASON_LENGTH) return 12;
  let rest = d;
  for (let m = 0; m < 6; m += 1) {
    if (rest < SEASON_DAYS[m]) return 6 + m + rest / SEASON_DAYS[m];
    rest -= SEASON_DAYS[m];
  }
  return 12;
}
const pct = (months) => `${(months / 12) * 100}%`;

const Swatch = ({ bg, children }) => (
  <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-4 w-6 rounded border border-stone-400" style={{ background: bg }} />{children}</li>
);

export default function SeasonCalendar({ result, state, climate, scenarioLabel }) {
  const tr = useTr();
  const monthly = climate.scenarios[state.scenarioId].monthly;
  const stress = monthlyStress(monthly, { rainPct: state.rainPct, tempDelta: state.tempDelta });
  const dryRice = state.situationId === 'after_dry_rice';
  const start = result.planting.day;
  const firstFlag = stress.findIndex((s) => s.waterStress || s.heatStress);
  const [month, setMonth] = useState(null);
  const [rowId, setRowId] = useState(null);
  const mi = month ?? (firstFlag >= 0 ? firstFlag : 0);
  const sel = stress[mi];

  const rows = result.ranked.map((r) => {
    const segs = [{ from: 0, to: 6, label: 'Wet-season rice', fill: WET }];
    let covered = 0;
    if (dryRice && !r.blocked) { segs.push({ from: 6, to: pos(start), label: 'Dry-season rice', fill: DRY_RICE }); covered += start; }
    if (!r.blocked && !r.fallow) {
      const endDay = Math.min(r.end, SEASON_LENGTH);
      segs.push({ from: pos(start), to: pos(endDay), label: r.crop.short, fill: ROTATION_COLORS[r.id] });
      covered += endDay - start;
    }
    return { r, segs, bareDays: Math.max(0, SEASON_LENGTH - covered) };
  });
  const picked = rows.find((x) => x.r.id === rowId) ?? rows[0];
  const describe = ({ r, bareDays }) => (r.blocked ? 'Blocked on this soil, so it is not placed on the calendar.'
    : r.fallow ? `The field stays bare for about ${(bareDays / 30.4).toFixed(0)} months of December to May.`
      : `Covers the field for ${r.crop.duration} days, from ${dateOfDay(r.start)} to about ${dateOfDay(r.end)}. About ${(bareDays / 30.4).toFixed(1)} months of December to May stay bare.`);
  const flags = stress.filter((s) => s.waterStress).map((s) => `${s.month} (water)`).concat(stress.filter((s) => s.heatStress).map((s) => `${s.month} (heat)`));

  return (
    <section aria-labelledby="cal-title" className="card">
      <h2 id="cal-title" className="text-xl font-bold text-green-950">{tr('Season calendar: bare fields and vulnerable months')}</h2>
      <p className="text-sm text-stone-700">Scenario: {scenarioLabel}. June to November shows wet-season rice as an assumption. Pick a month or a row for details.</p>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="min-w-[760px] space-y-1.5">
          <div className="grid items-end" style={cols}>
            <span />
            {MONTHS.map((m, i) => <span key={m} className={`pb-1 text-center text-sm font-semibold ${i >= 6 ? 'text-stone-900' : 'text-stone-500'}`}>{m}</span>)}
          </div>

          {[['Water', 'waterStress', 'dry'], ['Heat (35 °C+)', 'heatStress', null]].map(([name, key, word]) => (
            <div key={key} className="grid items-center" style={cols}>
              <span className="pr-2 text-sm font-semibold">{name}</span>
              <span className="col-span-6 mx-px flex h-9 items-center justify-center rounded-md bg-stone-100 text-sm text-stone-600">not assessed (wet season)</span>
              {stress.map((s, i) => {
                const flag = s[key];
                return (
                  <button key={s.month} type="button" aria-pressed={mi === i} onClick={() => setMonth(i)}
                    aria-label={`${s.month}: ${name} ${flag ? 'flagged' : 'ok'}`}
                    className={`heat-col mx-px flex h-9 items-center justify-center rounded-md border text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${flag ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700'} ${mi === i ? 'ring-2 ring-green-800 ring-offset-1' : ''}`}>
                    {flag ? (word ?? `${Math.round(s.hotDays)} d`) : 'ok'}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="pt-2" />
          {rows.map((row) => {
            const { r, segs } = row; const on = picked.r.id === r.id;
            return (
              <button key={r.id} type="button" aria-pressed={on} onClick={() => setRowId(r.id)} aria-label={`${r.crop.short}: ${describe(row)}`}
                className={`heat-col grid w-full items-center rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${on ? 'bg-stone-200' : ''}`} style={cols}>
                <span className="px-2 text-sm font-bold">{r.crop.short}</span>
                <span className="relative col-span-12 my-1 mr-1 block h-10 overflow-hidden rounded-md border border-stone-400" style={{ background: BARE }}>
                  {segs.map((s) => s.to > s.from && (
                    <span key={s.label} className="absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap border-r border-stone-600 px-2 text-sm font-semibold text-stone-950"
                      style={{ left: pct(s.from), width: pct(s.to - s.from), background: s.fill }}>
                      {s.to - s.from >= 1 ? s.label : ''}
                    </span>
                  ))}
                  {r.blocked && <span className="absolute inset-y-0 flex items-center bg-white/80 px-2 text-sm font-semibold" style={{ left: pct(6), width: pct(6) }}>Blocked on this soil</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        <Swatch bg={WET}>Wet-season rice (assumed)</Swatch>
        {dryRice && <Swatch bg={DRY_RICE}>Dry-season rice</Swatch>}
        <Swatch bg={BARE}>Bare field</Swatch>
        <Swatch bg={ROTATION_COLORS.rice_mungbean}>Dry-season crop (colour per crop)</Swatch>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="inline-block rounded bg-stone-900 px-1.5 text-xs font-bold text-white">dry</span>Flagged month</li>
      </ul>

      <div aria-live="polite" className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
          <p className="font-bold">{sel.month}: {sel.waterStress ? 'water stress flagged' : 'water ok'}, {sel.heatStress ? 'heat flagged' : 'heat ok'}</p>
          <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-3 tabular-nums">
            <dt>Usable rain</dt><dd className="text-right font-semibold">{Math.round(sel.peffMm)} mm</dd>
            <dt>Need of a full-cover crop</dt><dd className="text-right font-semibold">{Math.round(sel.demandMm)} mm</dd>
            <dt>Rain as share of need</dt><dd className="text-right font-semibold">{Math.round(100 * sel.ratio)}%</dd>
            <dt>Days at 35 °C or hotter</dt><dd className="text-right font-semibold">{Math.round(sel.hotDays)}</dd>
          </dl>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
          <p className="font-bold">{picked.r.crop.name}</p>
          <p className="mt-1">{describe(picked)}</p>
        </div>
      </div>

      <p className="mt-3 text-sm">
        Vulnerable months in this scenario: <strong>{flags.join(', ') || 'none flagged'}</strong>.
        Water stress means usable rain below half of a full-cover crop's need; heat means 5 or more days at 35 °C or hotter. Scenarios summarise past seasons; they are not forecasts.
      </p>
    </section>
  );
}
