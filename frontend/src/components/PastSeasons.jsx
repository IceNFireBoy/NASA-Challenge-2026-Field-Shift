// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useMemo, useState } from 'react';
import { replaySeasons, pickRain, SEASON_MONTHS, formatPhp } from '../engine/engine.js';
import { CROPS, ROTATION_IDS } from '../engine/params.js';

const card = 'rounded-lg border border-stone-300 bg-white p-4';
const label = (s) => `${s.start_year}-${String((s.start_year + 1) % 100).padStart(2, '0')}`;

function linfit(pts) {
  const n = pts.length; const mx = pts.reduce((a, p) => a + p[0], 0) / n; const my = pts.reduce((a, p) => a + p[1], 0) / n;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0); const sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0);
  const m = sxx ? sxy / sxx : 0; return { m, b: my - m * mx };
}

function TrendChart({ climate }) {
  const { series } = climate.trend;
  const byYear = Object.fromEntries(climate.seasons.map((s) => [s.start_year, s]));
  const rainSource = pickRain(climate.scenarios.typical.monthly).source === 'imerg' ? 'GPM IMERG' : 'NASA POWER';
  const W = 720; const H = 260; const L = 50; const R = 10; const T = 20; const B = 50;
  const max = Math.max(...series.map((s) => s.rain_total_mm)) * 1.1;
  const bw = (W - L - R) / series.length;
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const fit = linfit(series.map((s, i) => [i, s.rain_total_mm]));
  const t = climate.trend;
  const tmin = Math.min(...series.map((s) => s.tmax_mean_c)) - 0.5; const tmax = Math.max(...series.map((s) => s.tmax_mean_c)) + 0.5;
  const H2 = 130; const yt = (v) => 15 + (H2 - 45) * (1 - (v - tmin) / (tmax - tmin));
  const tpath = series.map((s, i) => `${i ? 'L' : 'M'}${L + bw * (i + 0.5)},${yt(s.tmax_mean_c)}`).join(' ');
  return (
    <section aria-labelledby="trend-t" className={card}>
      <h2 id="trend-t" className="text-lg font-bold text-green-900">Long-term trend: Dec-May rainfall and heat, {series.length} seasons</h2>
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="trend-svg-t" className="min-w-[560px] w-full">
          <title id="trend-svg-t">Dec-May rainfall per season with El Niño seasons outlined and a trend line</title>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}><line x1={L} x2={W - R} y1={y(max * f / 1.1)} y2={y(max * f / 1.1)} stroke="#e7e5e4" /><text x={L - 4} y={y(max * f / 1.1) + 4} textAnchor="end" fontSize="10" fill="#44403c">{Math.round(max * f / 1.1)}</text></g>)}
          {series.map((s, i) => {
            const ss = byYear[s.start_year]; const nino = ss?.enso === 'el_nino' || ss?.enso === 'El Nino' || /nino/i.test(ss?.enso || '') && !/nina/i.test(ss?.enso || '');
            return (
              <g key={s.start_year}>
                <rect x={L + bw * i + 2} y={y(s.rain_total_mm)} width={bw - 4} height={H - B - y(s.rain_total_mm)} fill="#56B4E9" stroke={nino ? '#D55E00' : 'none'} strokeWidth="3"><title>{`${label(s)}: ${Math.round(s.rain_total_mm)} mm${nino ? ' (El Niño)' : ''}`}</title></rect>
                <text x={L + bw * (i + 0.5)} y={H - B + 12} fontSize="8" textAnchor="middle" fill="#44403c" transform={`rotate(-60 ${L + bw * (i + 0.5)} ${H - B + 12})`}>{label(s)}</text>
              </g>
            );
          })}
          <line x1={L + bw * 0.5} y1={y(fit.b)} x2={L + bw * (series.length - 0.5)} y2={y(fit.b + fit.m * (series.length - 1))} stroke="#1c1917" strokeWidth="2" strokeDasharray="6 3" />
          <text x={12} y={H / 2} fontSize="11" fill="#44403c" transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle">Dec-May rain (mm)</text>
        </svg>
      </div>
      <ul className="flex flex-wrap gap-x-4 text-xs text-stone-700"><li>▮ Rain per season</li><li>▭ Orange outline = El Niño season</li><li>┄ Trend line</li></ul>
      <p className="mt-1 text-sm">Trend: {t.rain_mm_per_decade > 0 ? '+' : ''}{Number(t.rain_mm_per_decade).toFixed(0)} mm per decade ({rainSource} rainfall). A trend over {series.length} seasons is indicative, not conclusive.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H2}`} role="img" aria-labelledby="tmax-svg-t" className="min-w-[560px] w-full">
          <title id="tmax-svg-t">Mean daily maximum temperature, Dec-May, per season</title>
          <path d={tpath} fill="none" stroke="#D55E00" strokeWidth="2" />
          {series.map((s, i) => <circle key={s.start_year} cx={L + bw * (i + 0.5)} cy={yt(s.tmax_mean_c)} r="3" fill="#D55E00"><title>{`${label(s)}: ${s.tmax_mean_c.toFixed(1)} °C`}</title></circle>)}
          <text x={L - 4} y={yt(tmax) + 4} textAnchor="end" fontSize="10">{tmax.toFixed(1)}</text>
          <text x={L - 4} y={yt(tmin) + 4} textAnchor="end" fontSize="10">{tmin.toFixed(1)}</text>
          <text x={12} y={H2 / 2} fontSize="11" fill="#44403c" transform={`rotate(-90 12 ${H2 / 2})`} textAnchor="middle">Mean Tmax (°C)</text>
          <text x={W / 2} y={H2 - 6} fontSize="11" textAnchor="middle" fill="#44403c">Season start year, {series[0].start_year} to {series[series.length - 1].start_year}</text>
        </svg>
      </div>
      <p className="text-sm">Mean Tmax trend: {t.tmax_c_per_decade > 0 ? '+' : ''}{Number(t.tmax_c_per_decade).toFixed(2)} °C per decade (NASA POWER). Indicative, not conclusive.</p>
    </section>
  );
}

function Replay({ inputs }) {
  const [mode, setMode] = useState('water');
  const rows = useMemo(() => replaySeasons(inputs), [inputs]);
  const color = (c) => {
    if (c.blocked) return { bg: '#d6d3d1', t: '×' };
    if (mode === 'water') {
      if (c.pctMet == null) return { bg: '#e7e5e4', t: '–' };
      const p = c.pctMet; return p > 0.8 ? { bg: '#86d9a8', t: '✓' } : p >= 0.5 ? { bg: '#fcd34d', t: '~' } : { bg: '#f87171', t: '!' };
    }
    return c.net >= 0 ? { bg: '#86d9a8', t: '+' } : { bg: '#f87171', t: '−' };
  };
  const mung = rows.filter((r) => (r.cells.rice_mungbean.pctMet ?? 0) >= 0.8).length;
  const cw = 26; const L = 110; const W = L + cw * rows.length + 10; const H = 40 + 30 * ROTATION_IDS.length + 10;
  return (
    <section aria-labelledby="rep-t" className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="rep-t" className="text-lg font-bold text-green-900">Replay: every past season with your settings</h2>
        <div role="group" aria-label="Replay measure" className="flex gap-1">
          {[['water', 'Water need met'], ['net', 'Net PHP/ha sign']].map(([id, l]) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={`min-h-[44px] rounded border px-3 text-sm ${mode === id ? 'border-green-800 bg-green-800 font-semibold text-white' : 'border-stone-400'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="rep-svg-t" className="w-full" style={{ minWidth: W * 0.9 }}>
          <title id="rep-svg-t">Heatmap of rotations by past season</title>
          {rows.map((r, i) => {
            const nino = /nino/i.test(r.enso || '') && !/nina/i.test(r.enso || '');
            return <text key={r.id} x={L + cw * (i + 0.5)} y={32} fontSize="8" textAnchor="start" transform={`rotate(-60 ${L + cw * (i + 0.5)} 32)`} fill={nino ? '#b45309' : '#44403c'} fontWeight={nino ? 700 : 400}>{r.id}{nino ? ' EN' : ''}</text>;
          })}
          {ROTATION_IDS.map((id, k) => (
            <g key={id}>
              <text x={L - 6} y={60 + k * 30 + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="#292524">{CROPS[id].short}</text>
              {rows.map((r, i) => { const c = color(r.cells[id]); return (
                <g key={r.id}><rect x={L + cw * i + 1} y={48 + k * 30} width={cw - 2} height={26} fill={c.bg} stroke="#a8a29e"><title>{`${r.id} ${CROPS[id].short}: ${r.cells[id].blocked ? 'blocked' : r.cells[id].pctMet == null ? 'no crop' : `${Math.round(100 * r.cells[id].pctMet)}% water met`}, net ${formatPhp(r.cells[id].net)}`}</title></rect>
                  <text x={L + cw * (i + 0.5)} y={65 + k * 30} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1c1917">{c.t}</text></g>); })}
            </g>
          ))}
        </svg>
      </div>
      <ul className="flex flex-wrap gap-x-4 text-xs text-stone-700">
        {mode === 'water' ? <><li>✓ green: over 80% met</li><li>~ amber: 50-80%</li><li>! red: under 50%</li><li>– no crop (fallow)</li><li>× blocked on this soil</li></> : <><li>+ green: net positive</li><li>− red: net negative</li></>}
        <li>EN after the season = El Niño season</li>
      </ul>
      <p className="mt-1 text-sm">Mungbean met at least 80% of its water need in {mung} of {rows.length} past seasons (using your planting date and soil; water need met counts rain and stored soil water only). Past seasons are not forecasts.</p>
    </section>
  );
}

function ScenarioChart({ climate, scenarioId }) {
  const [src, setSrc] = useState('scenario');
  const typ = climate.scenarios.typical.monthly; const sc = climate.scenarios[scenarioId].monthly;
  const hasImerg = Array.isArray(typ.rain_imerg_mm);
  const a = src === 'source' && hasImerg ? typ.rain_imerg_mm : pickRain(typ).rain;
  const b = src === 'source' && hasImerg ? typ.rain_power_mm : pickRain(sc).rain;
  const la = src === 'source' && hasImerg ? 'IMERG (typical)' : 'Typical year'; const lb = src === 'source' && hasImerg ? 'POWER (typical)' : climate.scenarios[scenarioId].label.split(' (')[0];
  const same = !(src === 'source' && hasImerg) && scenarioId === 'typical'; // both series would be the typical year
  const W = 720; const H = 260; const L = 50; const T = 15; const B = 40;
  const max = Math.max(...a, ...b, ...typ.et0_mm) * 1.1; const y = (v) => T + (H - T - B) * (1 - v / max);
  const gw = (W - L - 10) / 6;
  const et = typ.et0_mm.map((v, i) => `${i ? 'L' : 'M'}${L + gw * (i + 0.5)},${y(v)}`).join(' ');
  return (
    <section aria-labelledby="sc-t" className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sc-t" className="text-lg font-bold text-green-900">Monthly rain vs crop water demand</h2>
        <div role="group" aria-label="Comparison" className="flex gap-1">
          <button type="button" aria-pressed={src === 'scenario'} onClick={() => setSrc('scenario')} className={`min-h-[44px] rounded border px-3 text-sm ${src === 'scenario' ? 'border-green-800 bg-green-800 text-white' : 'border-stone-400'}`}>Typical vs scenario</button>
          <button type="button" aria-pressed={src === 'source'} disabled={!hasImerg} onClick={() => setSrc('source')} className={`min-h-[44px] rounded border px-3 text-sm disabled:opacity-50 ${src === 'source' ? 'border-green-800 bg-green-800 text-white' : 'border-stone-400'}`}>IMERG vs POWER</button>
        </div>
      </div>
      {!hasImerg && <p className="text-sm text-sky-900">IMERG vs POWER is unavailable: IMERG data was not downloaded, so only NASA POWER rainfall is shown.</p>}
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="sc-svg-t" className="min-w-[560px] w-full">
          <title id="sc-svg-t">Paired bars of monthly rainfall with reference evapotranspiration as a line</title>
          {[0, 0.5, 1].map((f) => <g key={f}><line x1={L} x2={W - 10} y1={y(max * f / 1.1)} y2={y(max * f / 1.1)} stroke="#e7e5e4" /><text x={L - 4} y={y(max * f / 1.1) + 4} textAnchor="end" fontSize="10">{Math.round(max * f / 1.1)}</text></g>)}
          {SEASON_MONTHS.map((m, i) => (
            <g key={m}>
              <rect x={L + gw * i + gw * 0.12} y={y(a[i])} width={gw * 0.36} height={H - B - y(a[i])} fill="#0072B2"><title>{`${m} ${la}: ${Math.round(a[i])} mm`}</title></rect>
              {!same && <rect x={L + gw * i + gw * 0.5} y={y(b[i])} width={gw * 0.36} height={H - B - y(b[i])} fill="#E69F00"><title>{`${m} ${lb}: ${Math.round(b[i])} mm`}</title></rect>}
              <text x={L + gw * (i + 0.5)} y={H - B + 16} textAnchor="middle" fontSize="11">{m}</text>
            </g>
          ))}
          <path d={et} fill="none" stroke="#1c1917" strokeWidth="2" strokeDasharray="5 3" />
          <text x={12} y={H / 2} fontSize="11" transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle" fill="#44403c">mm per month</text>
        </svg>
      </div>
      <ul className="flex flex-wrap gap-x-4 text-xs text-stone-700"><li><span style={{ color: '#0072B2' }}>▮</span> {la}</li>{!same && <li><span style={{ color: '#E69F00' }}>▮</span> {lb}</li>}<li>┄ Reference ET0 (typical year)</li></ul>
      <p className="mt-1 text-sm">Where the bars fall below the dashed line, rain alone does not meet a well-watered crop's demand. {same ? 'Pick an El Niño scenario in Compare to see it beside the typical year. ' : ''}{src === 'source' ? 'Satellite-gauge (IMERG) vs model reanalysis (POWER): why combining sources matters.' : ''}</p>
    </section>
  );
}

export default function PastSeasons({ climate, inputs }) {
  return (
    <div className="space-y-4">
      <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">Past seasons show what happened; they are not forecasts of 2026-27.</p>
      <TrendChart climate={climate} />
      <Replay inputs={inputs} />
      <ScenarioChart climate={climate} scenarioId={inputs.scenarioId} />
    </div>
  );
}
