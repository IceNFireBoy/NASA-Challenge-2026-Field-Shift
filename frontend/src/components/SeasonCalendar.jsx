// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { SEASON_DAYS, SEASON_LENGTH, monthlyStress } from '../engine/engine.js';
import { dateOfDay } from '../engine/content.js';
import { ROTATION_COLORS } from '../lib/colors.js';

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
const W = 720; const LEFT = 150; const COL = (W - LEFT) / 12;

// Season day (0 = Dec 1) -> position along Jun..May axis, in months.
function pos(d) {
  if (d >= SEASON_LENGTH) return 12;
  let rest = d;
  for (let m = 0; m < 6; m += 1) {
    if (rest < SEASON_DAYS[m]) return 6 + m + rest / SEASON_DAYS[m];
    rest -= SEASON_DAYS[m];
  }
  return 12;
}
const x = (p) => LEFT + p * COL;

export default function SeasonCalendar({ result, state, climate, scenarioLabel }) {
  const monthly = climate.scenarios[state.scenarioId].monthly;
  const stress = monthlyStress(monthly, { rainPct: state.rainPct, tempDelta: state.tempDelta });
  const dryRice = state.situationId === 'after_dry_rice';
  const start = result.planting.day;
  const rowH = 34; const top = 78;
  const H = top + result.ranked.length * rowH + 8;

  const rows = result.ranked.map((r) => {
    const segs = [{ from: 0, to: 6, label: 'Wet-season rice (typical, assumed)', fill: '#cfe3d4' }];
    let covered = 0;
    if (dryRice && !r.blocked) { segs.push({ from: 6, to: pos(start), label: 'Dry-season rice', fill: '#9fc7ad' }); covered += start; }
    if (!r.blocked && !r.fallow) {
      const endDay = Math.min(r.end, SEASON_LENGTH);
      segs.push({ from: pos(start), to: pos(endDay), label: r.crop.short, fill: ROTATION_COLORS[r.id], crop: true });
      covered += endDay - start;
    }
    const bareDays = Math.max(0, SEASON_LENGTH - covered);
    return { r, segs, bareDays };
  });

  return (
    <section aria-labelledby="cal-title" className="card">
      <h2 id="cal-title" className="text-xl font-bold text-green-950">Season calendar: bare fields and vulnerable months</h2>
      <p className="text-sm text-stone-600">Scenario: {scenarioLabel}. June to November shows wet-season rice as an assumption; adjust your field situation in Compare.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="cal-svg-title cal-svg-desc" className="min-w-[640px] w-full">
          <title id="cal-svg-title">Twelve-month field calendar, June to May, for each rotation</title>
          <desc id="cal-svg-desc">Bars show wet-season rice, the dry-season crop and bare field. Top rows mark months of water stress and heat.</desc>
          <defs>
            <pattern id="bare" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#f3efe8" /><line x1="0" y1="0" x2="0" y2="6" stroke="#b8ae9c" strokeWidth="2" /></pattern>
          </defs>
          {MONTHS.map((m, i) => <text key={m} x={x(i) + COL / 2} y={14} textAnchor="middle" fontSize="12" fill="#44403c">{m}</text>)}
          <text x={LEFT - 8} y={34} textAnchor="end" fontSize="11" fill="#44403c">Water stress</text>
          <text x={LEFT - 8} y={58} textAnchor="end" fontSize="11" fill="#44403c">Heat (35 °C+)</text>
          {stress.map((s, i) => (
            <g key={s.month}>
              <rect x={x(6 + i) + 1} y={22} width={COL - 2} height={18} rx="3" fill={s.waterStress ? '#fde68a' : '#f5f5f4'} stroke={s.waterStress ? '#b45309' : '#d6d3d1'} />
              <text x={x(6 + i) + COL / 2} y={35} textAnchor="middle" fontSize="11" fontWeight="600" fill="#292524">{s.waterStress ? 'dry' : 'ok'}</text>
              <rect x={x(6 + i) + 1} y={46} width={COL - 2} height={18} rx="3" fill={s.heatStress ? '#fecaca' : '#f5f5f4'} stroke={s.heatStress ? '#b91c1c' : '#d6d3d1'} />
              <text x={x(6 + i) + COL / 2} y={59} textAnchor="middle" fontSize="11" fontWeight="600" fill="#292524">{s.heatStress ? `${Math.round(s.hotDays)} d` : 'ok'}</text>
            </g>
          ))}
          {rows.map(({ r, segs }, k) => {
            const y = top + k * rowH;
            return (
              <g key={r.id}>
                <text x={LEFT - 8} y={y + 19} textAnchor="end" fontSize="12" fontWeight="600" fill="#292524">{r.crop.short}</text>
                <rect x={LEFT} y={y + 4} width={12 * COL} height={22} fill="url(#bare)" stroke="#b8ae9c" />
                {segs.map((s) => s.to > s.from && (
                  <g key={s.label}>
                    <rect x={x(s.from)} y={y + 4} width={(s.to - s.from) * COL} height={22} fill={s.fill} stroke="#57534e" />
                    {(s.to - s.from) * COL > 38 && <text x={x(s.from) + 4} y={y + 19} fontSize="11" fill={s.crop ? '#0c0a09' : '#1c1917'} fontWeight="600">{s.crop ? s.label : s.label.length > 22 && (s.to - s.from) < 8 ? 'Rice' : s.label}</text>}
                  </g>
                ))}
                {r.blocked && <text x={LEFT + 6 * COL + 6} y={y + 19} fontSize="11" fill="#7f1d1d" fontWeight="600">Blocked on this soil</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        <li className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-3.5 w-3.5 border border-stone-600" style={{ background: '#cfe3d4' }} />Wet-season rice (assumed)</li>
        {dryRice && <li className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-3.5 w-3.5 border border-stone-600" style={{ background: '#9fc7ad' }} />Dry-season rice</li>}
        <li className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-3.5 w-3.5 border border-stone-400" style={{ background: 'repeating-linear-gradient(45deg, #f3efe8 0 3px, #b8ae9c 3px 5px)' }} />Bare field (hatched)</li>
        <li className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-3.5 w-3.5 border border-stone-600" style={{ background: '#009E73' }} />Dry-season crop (colour per crop)</li>
      </ul>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {rows.map(({ r, bareDays }) => (
          <li key={r.id}>
            {r.blocked ? `${r.crop.short}: blocked on this soil.`
              : r.fallow ? `Fallow leaves the field bare for about ${(bareDays / 30.4).toFixed(0)} months of Dec-May.`
                : `${r.crop.short} covers the field for ${r.crop.duration} days (${dateOfDay(r.start)} to about ${dateOfDay(r.end)}); about ${(bareDays / 30.4).toFixed(1)} months of Dec-May stay bare.`}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm">
        Vulnerable months in this scenario: {stress.filter((s) => s.waterStress).map((s) => `${s.month} (water)`).concat(stress.filter((s) => s.heatStress).map((s) => `${s.month} (heat)`)).join(', ') || 'none flagged'}.
        Water stress means effective rain below half of a full-cover crop's need; heat means 5 or more days at 35 °C or hotter. Scenarios summarise past seasons; they are not forecasts.
      </p>
    </section>
  );
}
