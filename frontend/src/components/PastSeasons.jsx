// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { replaySeasons, pickRain, SEASON_MONTHS, formatPhp } from '../engine/engine.js';
import { CROPS, ROTATION_IDS } from '../engine/params.js';

const BLUE = '#0072B2'; const SKY = '#56B4E9'; const ORANGE = '#D55E00'; const AMBER = '#E69F00'; const INK = '#1c1917';
const label = (y) => `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
const isNino = (enso) => /nino/i.test(enso || '') && !/nina/i.test(enso || '');
const ENSO_LABEL = { el_nino: 'El Niño', la_nina: 'La Niña', neutral: 'Neutral' };
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const anim = () => ({ isAnimationActive: !reduced(), animationDuration: 250, animationEasing: 'ease-out' });
const axis = { tick: { fontSize: 13, fill: '#44403c' }, tickLine: false, axisLine: { stroke: '#a8a29e' } };

// Least-squares line through equally spaced values; returns the fitted value at each point.
function linfit(ys) {
  const n = ys.length; const mx = (n - 1) / 2; const my = ys.reduce((a, v) => a + v, 0) / n;
  const sxx = ys.reduce((a, _, i) => a + (i - mx) ** 2, 0); const sxy = ys.reduce((a, v, i) => a + (i - mx) * (v - my), 0);
  const m = sxx ? sxy / sxx : 0; return ys.map((_, i) => my + m * (i - mx));
}

function Toggle({ label: aria, options, value, onChange }) {
  return (
    <div role="group" aria-label={aria} className="inline-flex rounded-xl bg-stone-200 p-1">
      {options.map(([id, text, disabled]) => (
        <button key={id} type="button" aria-pressed={value === id} disabled={disabled} onClick={() => onChange(id)}
          className={`pressable min-h-[2.5rem] rounded-lg px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 disabled:opacity-50 ${value === id ? 'bg-green-800 text-white shadow-sm' : 'text-stone-800'}`}>{text}</button>
      ))}
    </div>
  );
}

function Tip({ active, payload, title, rows }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-bold">{title(d)}</p>
      {rows(d).map(([k, v, color]) => (
        <p key={k} className="flex items-center gap-2 tabular-nums">
          {color && <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />}{k}: <strong>{v}</strong>
        </p>
      ))}
    </div>
  );
}

const Key = ({ color, dashed, children }) => (
  <li className="flex items-center gap-1.5">
    <span aria-hidden="true" className="inline-block h-3 w-4 rounded-sm" style={dashed ? { borderTop: `3px dashed ${color}`, height: 0 } : { background: color }} />{children}
  </li>
);

function TrendChart({ climate }) {
  const [metric, setMetric] = useState('rain');
  const { series } = climate.trend;
  const t = climate.trend;
  const rainSource = pickRain(climate.scenarios.typical.monthly).source === 'imerg' ? 'GPM IMERG' : 'NASA POWER';
  const data = useMemo(() => {
    const byYear = Object.fromEntries(climate.seasons.map((s) => [s.start_year, s]));
    const rainFit = linfit(series.map((s) => s.rain_total_mm));
    const tmaxFit = linfit(series.map((s) => s.tmax_mean_c));
    return series.map((s, i) => {
      const season = byYear[s.start_year];
      return { name: label(s.start_year), rain: s.rain_total_mm, tmax: s.tmax_mean_c, rainFit: rainFit[i], tmaxFit: tmaxFit[i],
        nino: isNino(season?.enso), enso: ENSO_LABEL[season?.enso] ?? 'n/a', strength: season?.strength };
    });
  }, [climate, series]);
  const rain = metric === 'rain';
  return (
    <section aria-labelledby="trend-t" className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="trend-t" className="text-xl font-bold text-green-950">Long-term trend, {series.length} dry seasons</h2>
        <Toggle label="Measure" value={metric} onChange={setMetric} options={[['rain', 'Rainfall'], ['tmax', 'Heat']]} />
      </div>
      <p className="text-sm text-stone-700">{rain ? 'Total December to May rainfall per season, in mm.' : 'Average daily maximum temperature, December to May.'} Hover or tap a season for its numbers.</p>
      <div className="mt-3 overflow-x-auto">
        <div className="h-80 min-w-[600px]" role="img" aria-label={rain ? 'Bar chart of Dec-May rainfall per season with El Niño seasons in orange and a dashed trend line' : 'Line chart of mean daily maximum temperature per season with a dashed trend line'}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid vertical={false} stroke="#e7e5e4" />
              <XAxis dataKey="name" {...axis} interval={0} angle={-55} textAnchor="end" height={56} tick={{ fontSize: 11, fill: '#44403c' }} />
              <YAxis {...axis} width={52} tickFormatter={(v) => (rain ? v.toLocaleString('en-PH') : `${v}°`)} domain={rain ? [0, 'auto'] : [(min) => Math.floor(min - 0.5), (max) => Math.ceil(max + 0.5)]} />
              <Tooltip cursor={{ fill: '#f5f5f4' }} content={<Tip title={(d) => `${d.name} · ${d.enso}${d.strength ? ` (${d.strength})` : ''}`}
                rows={(d) => (rain ? [['Rain', `${Math.round(d.rain)} mm`, d.nino ? ORANGE : SKY], ['Trend', `${Math.round(d.rainFit)} mm`, INK]]
                  : [['Mean Tmax', `${d.tmax.toFixed(1)} °C`, ORANGE], ['Trend', `${d.tmaxFit.toFixed(1)} °C`, INK]])} />} />
              {rain
                ? <Bar dataKey="rain" radius={[5, 5, 0, 0]} {...anim()}>{data.map((d) => <Cell key={d.name} fill={d.nino ? ORANGE : SKY} />)}</Bar>
                : <Line dataKey="tmax" stroke={ORANGE} strokeWidth={2.5} dot={{ r: 4, fill: ORANGE, strokeWidth: 0 }} activeDot={{ r: 7 }} {...anim()} />}
              <Line dataKey={rain ? 'rainFit' : 'tmaxFit'} stroke={INK} strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={false} {...anim()} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        {rain ? <><Key color={SKY}>Rain per season</Key><Key color={ORANGE}>El Niño season</Key></> : <Key color={ORANGE}>Mean daily maximum</Key>}
        <Key color={INK} dashed>Trend line</Key>
      </ul>
      <p className="mt-2 text-sm">
        {rain
          ? <>Trend: <strong>{t.rain_mm_per_decade > 0 ? '+' : ''}{Number(t.rain_mm_per_decade).toFixed(0)} mm per decade</strong> ({rainSource} rainfall).</>
          : <>Trend: <strong>{t.tmax_c_per_decade > 0 ? '+' : ''}{Number(t.tmax_c_per_decade).toFixed(2)} °C per decade</strong> (NASA POWER).</>}
        {' '}A trend over {series.length} seasons is indicative, not conclusive.
      </p>
    </section>
  );
}

function Replay({ inputs }) {
  const [mode, setMode] = useState('water');
  const rows = useMemo(() => replaySeasons(inputs), [inputs]);
  const [sel, setSel] = useState(null);
  const [hover, setHover] = useState(null);
  const picked = rows.find((r) => r.id === sel) ?? rows[rows.length - 1];
  const cell = (c) => {
    if (c.blocked) return { bg: '#d6d3d1', t: '×', text: 'blocked on this soil' };
    if (mode === 'water') {
      if (c.pctMet == null) return { bg: '#e7e5e4', t: '–', text: 'no crop' };
      const p = c.pctMet; const text = `${Math.round(100 * p)}% of water need met`;
      return p > 0.8 ? { bg: '#86d9a8', t: '✓', text } : p >= 0.5 ? { bg: '#fcd34d', t: '~', text } : { bg: '#f87171', t: '!', text };
    }
    return c.net >= 0 ? { bg: '#86d9a8', t: '+', text: `net ${formatPhp(c.net)}/ha` } : { bg: '#f87171', t: '−', text: `net ${formatPhp(c.net)}/ha` };
  };
  const mung = rows.filter((r) => (r.cells.rice_mungbean.pctMet ?? 0) >= 0.8).length;
  return (
    <section aria-labelledby="rep-t" className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="rep-t" className="text-xl font-bold text-green-950">Replay: every past season with your settings</h2>
        <Toggle label="Replay measure" value={mode} onChange={setMode} options={[['water', 'Water need met'], ['net', 'Profit or loss']]} />
      </div>
      <p className="text-sm text-stone-700">Each column is one past dry season. Pick a season to see its details below.</p>
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="grid min-w-[760px] gap-y-1" style={{ gridTemplateColumns: `6rem repeat(${rows.length}, minmax(0, 1fr))` }} onMouseLeave={() => setHover(null)}>
          <span />
          {rows.map((r) => {
            const on = r.id === picked.id;
            return (
              <button key={r.id} type="button" aria-pressed={on} onClick={() => setSel(r.id)} onMouseEnter={() => setHover(r.id)}
                aria-label={`${r.id}${isNino(r.enso) ? ', El Niño season' : ''}`}
                className={`heat-col mx-px flex h-24 items-end justify-center rounded-t-lg pb-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${on ? 'bg-green-800 font-bold text-white' : hover === r.id ? 'bg-stone-200' : ''} ${!on && isNino(r.enso) ? 'font-bold text-orange-800' : ''}`}>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{r.id}{isNino(r.enso) ? ' EN' : ''}</span>
              </button>
            );
          })}
          {ROTATION_IDS.map((id) => (
            <div key={id} className="contents">
              <span className="flex items-center pr-2 text-sm font-semibold">{CROPS[id].short}</span>
              {rows.map((r) => {
                const c = cell(r.cells[id]); const on = r.id === picked.id;
                return (
                  <span key={r.id} title={`${r.id} ${CROPS[id].short}: ${c.text}`} onMouseEnter={() => setHover(r.id)} onClick={() => setSel(r.id)}
                    className={`heat-col mx-px flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-bold text-stone-950 ${on ? 'ring-2 ring-green-800' : hover === r.id ? 'ring-2 ring-stone-400' : ''}`} style={{ background: c.bg }}>
                    <span aria-hidden="true">{c.t}</span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div aria-live="polite" className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
        <p className="font-bold">{picked.id} · {ENSO_LABEL[picked.enso] ?? picked.enso}{picked.strength ? ` (${picked.strength})` : ''}{typeof picked.oni === 'number' ? ` · ONI ${picked.oni.toFixed(1)}` : ''}</p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ROTATION_IDS.map((id) => {
            const c = picked.cells[id];
            return (
              <div key={id} className="rounded-lg border border-stone-200 bg-white p-2 text-sm">
                <dt className="font-semibold">{CROPS[id].short}</dt>
                <dd className="tabular-nums text-stone-800">{c.blocked ? 'Blocked on this soil' : <>{c.pctMet == null ? 'No crop' : `${Math.round(100 * c.pctMet)}% water met`}<br />Net {formatPhp(c.net)}/ha{c.heatFlag ? <><br />Heat during flowering</> : null}</>}</dd>
              </div>
            );
          })}
        </dl>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        {mode === 'water' ? <><li>✓ over 80% met</li><li>~ 50 to 80%</li><li>! under 50%</li><li>– no crop (fallow)</li></> : <><li>+ net positive</li><li>− net negative</li></>}
        <li>× blocked on this soil</li><li>EN = El Niño season</li>
      </ul>
      <p className="mt-2 text-sm">Mungbean met at least 80% of its water need in <strong>{mung} of {rows.length}</strong> past seasons (using your planting date and soil; water need met counts rain and stored soil water only). Past seasons are not forecasts.</p>
    </section>
  );
}

function ScenarioChart({ climate, scenarioId }) {
  const [src, setSrc] = useState('scenario');
  const typ = climate.scenarios.typical.monthly; const sc = climate.scenarios[scenarioId].monthly;
  const hasImerg = Array.isArray(typ.rain_imerg_mm);
  const bySource = src === 'source' && hasImerg;
  const a = bySource ? typ.rain_imerg_mm : pickRain(typ).rain;
  const b = bySource ? typ.rain_power_mm : pickRain(sc).rain;
  const la = bySource ? 'IMERG (typical)' : 'Typical year'; const lb = bySource ? 'POWER (typical)' : climate.scenarios[scenarioId].label.split(' (')[0];
  const same = !bySource && scenarioId === 'typical'; // both series would be the typical year
  const data = SEASON_MONTHS.map((m, i) => ({ name: m, a: a[i], b: b[i], et0: typ.et0_mm[i] }));
  return (
    <section aria-labelledby="sc-t" className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sc-t" className="text-xl font-bold text-green-950">Monthly rain vs crop water demand (mm)</h2>
        <Toggle label="Comparison" value={src} onChange={setSrc} options={[['scenario', 'Typical vs scenario'], ['source', 'IMERG vs POWER', !hasImerg]]} />
      </div>
      {!hasImerg && <p className="text-sm text-sky-900">IMERG vs POWER is unavailable: IMERG data was not downloaded, so only NASA POWER rainfall is shown.</p>}
      <div className="mt-3 h-80" role="img" aria-label="Bars of monthly rainfall with reference evapotranspiration as a dashed line">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="#e7e5e4" />
            <XAxis dataKey="name" {...axis} />
            <YAxis {...axis} width={52} />
            <Tooltip cursor={{ fill: '#f5f5f4' }} content={<Tip title={(d) => d.name}
              rows={(d) => [[la, `${Math.round(d.a)} mm`, BLUE], ...(same ? [] : [[lb, `${Math.round(d.b)} mm`, AMBER]]), ['Reference ET0', `${Math.round(d.et0)} mm`, INK]]} />} />
            <Bar dataKey="a" fill={BLUE} radius={[5, 5, 0, 0]} maxBarSize={44} {...anim()} />
            {!same && <Bar dataKey="b" fill={AMBER} radius={[5, 5, 0, 0]} maxBarSize={44} {...anim()} />}
            <Line dataKey="et0" stroke={INK} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: INK }} {...anim()} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-800">
        <Key color={BLUE}>{la}</Key>{!same && <Key color={AMBER}>{lb}</Key>}<Key color={INK} dashed>Reference ET0 (typical year)</Key>
      </ul>
      <p className="mt-2 text-sm">Where the bars fall below the dashed line, rain alone does not meet a well-watered crop's demand. {same ? 'Pick an El Niño scenario in Compare to see it beside the typical year. ' : ''}{bySource ? 'Satellite-gauge (IMERG) vs model reanalysis (POWER): why combining sources matters.' : ''}</p>
    </section>
  );
}

export default function PastSeasons({ climate, inputs }) {
  return (
    <div className="space-y-4">
      <p className="callout text-sm font-semibold">Past seasons show what happened; they are not forecasts of 2026-27.</p>
      <TrendChart climate={climate} />
      <Replay inputs={inputs} />
      <ScenarioChart climate={climate} scenarioId={inputs.scenarioId} />
    </div>
  );
}
