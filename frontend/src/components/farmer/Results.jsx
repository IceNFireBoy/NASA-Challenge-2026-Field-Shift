// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useMemo, useState } from 'react';
import { evaluate } from '../../engine/engine.js';
import { buildWhyCard } from '../../engine/content.js';
import { SOILS } from '../../engine/params.js';
import { plainCard, plainReasons, plainText, trafficLights } from '../../lib/farmer.js';
import WhyCard from '../WhyCard.jsx';
import FarmerNotice from './FarmerNotice.jsx';
import FitBar from './FitBar.jsx';
import TrafficRow from './TrafficRow.jsx';
import { CropIcon } from './icons.jsx';

const DRY_SCENARIO = 'elnino_strong';
const CLOSE_CALL = 0.6; // same cut-off as the expert uncertainty panel
const secondary = 'pressable min-h-[3rem] rounded-xl border-2 border-stone-500 bg-white px-5 py-3 text-lg font-semibold text-stone-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500';
const disclosure = 'pressable flex min-h-[3rem] w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-500 bg-white px-5 py-3 text-left text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500';

function OptionCard({ r, ctx, t, i }) {
  return (
    <li className="rise-in rounded-2xl border-2 border-stone-300 bg-white p-4" style={{ '--i': i }}>
      <h4 className="flex items-center gap-3 text-xl font-bold"><span className="text-3xl leading-none"><CropIcon id={r.id} /></span>{t(`crop.${r.id}`)}</h4>
      {r.blocked ? (
        <p className="mt-2 rounded-lg border-2 border-red-700 bg-red-50 p-3 text-red-950">
          <strong>{t('results.blocked')}.</strong> {r.crop.blockOnClay ? t('results.blockedClay') : plainText(r.crop.blockReason)}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <FitBar value={r.final} label={t('results.fit', { n: Math.round(r.final) })} />
          <TrafficRow lights={trafficLights(r, ctx)} t={t} />
        </div>
      )}
    </li>
  );
}

export default function Results({ state, dispatch, result, unc, inputs, climate, t, onChangeAnswers }) {
  const [showOthers, setShowOthers] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const open = result.ranked.filter((r) => !r.blocked);
  const best = open[0];
  const others = result.ranked.filter((r) => r.id !== best.id);
  const dry = state.scenarioId !== 'typical';
  const ctx = { waterMode: state.waterMode, laborCap: state.laborCap };
  const reasons = plainReasons(best, ctx);
  const share = unc.topShare[best.id];

  // What a strong El Nino year would change, shown while the normal year is on screen.
  const dryBest = useMemo(
    () => (dry ? null : evaluate({ ...inputs, scenarioId: DRY_SCENARIO }).ranked.find((r) => !r.blocked)),
    [inputs, dry],
  );
  const card = useMemo(() => plainCard(buildWhyCard(best, {
    waterMode: state.waterMode, scenarioLabel: climate.scenarios[state.scenarioId].label,
    rainSource: result.rainSource, soilLabel: SOILS[state.soilId].label, rankCount: open.length,
  })), [best, state.waterMode, state.scenarioId, state.soilId, result.rainSource, open.length, climate]);

  const tweaked = state.tempDelta > 0 || state.plantingId || Object.values(state.overrides).some((o) => Object.keys(o).length > 0);
  const rain = state.rainPct;
  const rainText = rain === 0 ? t('rain.normal') : rain < 0 ? t('rain.less', { n: -rain }) : t('rain.more', { n: rain });

  return (
    <div className="space-y-4">
      <article aria-labelledby="best-h" className="rounded-2xl border-4 border-green-800 bg-white p-4 sm:p-6">
        <p className="font-semibold text-green-900">{t('results.best')}</p>
        <h3 id="best-h" key={best.id} className="rise-in mt-1 flex items-center gap-3 text-3xl font-bold leading-tight text-green-950">
          <span className="text-5xl leading-none"><CropIcon id={best.id} /></span>{t(`crop.${best.id}`)}
        </h3>
        <p className="mt-1 text-stone-700">{t(dry ? 'results.showing.dry' : 'results.showing.typical')}{rain !== 0 && <>, {rainText.toLowerCase()}</>}</p>
        <div className="mt-3"><FitBar key={best.id} strong value={best.final} label={t('results.fit', { n: Math.round(best.final) })} /></div>

        <h4 className="mt-4 text-lg font-bold">{t('results.reasons')}</h4>
        <ul className="mt-1 space-y-2">
          {reasons.map((r) => (
            <li key={r.id} className="flex gap-3"><span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-800 font-bold text-white">✓</span><span>{t(r.key, r.vars)}</span></li>
          ))}
        </ul>

        <div className="mt-4"><TrafficRow lights={trafficLights(best, ctx)} t={t} /></div>
        <p className="mt-3 text-stone-700">{t('results.sample')}</p>
        <p className="mt-2">{t('results.sure', { pct: Math.round(100 * share), n: unc.draws })}</p>
        {share < CLOSE_CALL && <p role="note" className="mt-2 rounded-lg border-2 border-amber-500 bg-amber-100 p-3 font-semibold text-amber-950">⚠ {t('results.close')}</p>}
        {dryBest && (
          <p className="mt-2 rounded-lg border border-stone-300 bg-stone-100 p-3">
            <span aria-hidden="true">☀️ </span>{t(dryBest.id === best.id ? 'results.dryNote.same' : 'results.dryNote.diff', { crop: t(`crop.${dryBest.id}`) })}
          </p>
        )}
      </article>

      <FarmerNotice t={t} />

      {tweaked && (
        <p className="rounded-xl border border-stone-400 bg-white p-4">
          {t('results.custom')}{' '}
          <button type="button" className="pressable min-h-[3rem] rounded-lg px-2 font-semibold text-green-900 underline focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500" onClick={() => dispatch({ type: 'clearExpertTweaks' })}>{t('results.customClear')}</button>
        </p>
      )}

      <section aria-labelledby="rain-h" className="rounded-2xl border-2 border-stone-300 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <label id="rain-h" htmlFor="f-rain" className="text-xl font-bold">{t('rain.title')}</label>
          <span className="text-lg font-bold tabular-nums text-green-900">{rainText}</span>
        </div>
        <input id="f-rain" type="range" min="-50" max="20" step="10" value={rain} aria-valuetext={rainText}
          onChange={(e) => dispatch({ type: 'set', key: 'rainPct', value: Number(e.target.value) })} className="mt-2 h-12 w-full accent-green-800" />
        <div className="flex justify-between text-stone-700" aria-hidden="true"><span>{t('rain.min')}</span><span>{t('rain.max')}</span></div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className={secondary} aria-pressed={dry}
          onClick={() => dispatch({ type: 'set', key: 'scenarioId', value: dry ? 'typical' : DRY_SCENARIO })}>
          <span aria-hidden="true">{dry ? '🌧️ ' : '☀️ '}</span>{t(dry ? 'results.tryNormal' : 'results.tryDry')}
        </button>
        <button type="button" className={secondary} onClick={onChangeAnswers}><span aria-hidden="true">✏️ </span>{t('results.change')}</button>
      </div>

      <div>
        <button type="button" className={disclosure} aria-expanded={showOthers} aria-controls="f-others" onClick={() => setShowOthers(!showOthers)}>
          {t(showOthers ? 'results.othersHide' : 'results.others', { n: others.length })}<span aria-hidden="true">{showOthers ? '▲' : '▼'}</span>
        </button>
        {showOthers && <ul id="f-others" className="mt-3 space-y-3">{others.map((r, i) => <OptionCard key={r.id} r={r} ctx={ctx} t={t} i={i} />)}</ul>}
      </div>

      <div>
        <button type="button" className={disclosure} aria-expanded={showWhy} aria-controls="f-why" onClick={() => setShowWhy(!showWhy)}>
          {t(showWhy ? 'results.whyHide' : 'results.why')}<span aria-hidden="true">{showWhy ? '▲' : '▼'}</span>
        </button>
        {showWhy && (
          <div id="f-why" lang="en" className="rise-in mt-3 rounded-2xl border-2 border-stone-300 bg-white p-4">
            {t('results.whyLang') && <p lang="fil" className="font-semibold text-stone-700">{t('results.whyLang')}</p>}
            <WhyCard card={card} className="text-base" />
          </div>
        )}
      </div>
    </div>
  );
}
