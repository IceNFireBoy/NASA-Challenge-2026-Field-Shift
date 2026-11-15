// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useEffect, useMemo, useReducer, useState } from 'react';
import climate from './data/climate.json';
import { evaluate, uncertainty } from './engine/engine.js';
import { buildWhyCard } from './engine/content.js';
import { SOILS } from './engine/params.js';
import { makeT } from './lib/i18n.js';
import { INITIAL, reducer, sanitize } from './lib/state.js';
import Header from './components/Header.jsx';
import Notice from './components/Notice.jsx';
import DataBanners from './components/DataBanners.jsx';
import FieldForm from './components/FieldForm.jsx';
import PrioritySliders from './components/PrioritySliders.jsx';
import ScenarioPicker from './components/ScenarioPicker.jsx';
import RotationCard from './components/RotationCard.jsx';
import EconomicsPanel from './components/EconomicsPanel.jsx';
import Footer from './components/Footer.jsx';
import UncertaintyPanel from './components/UncertaintyPanel.jsx';
import Community from './components/Community.jsx';
import DataMethods from './components/DataMethods.jsx';
import Tabs from './components/Tabs.jsx';
import PastSeasons from './components/PastSeasons.jsx';
import SeasonCalendar from './components/SeasonCalendar.jsx';
import FarmerFlow from './components/farmer/FarmerFlow.jsx';

const TABS = [
  { id: 'compare', label: 'Compare' },
  { id: 'calendar', label: 'Season calendar' },
  { id: 'past', label: 'Past seasons' },
  { id: 'community', label: 'Plan together' },
  { id: 'data', label: 'Data & methods' },
];

const KEY = 'fieldshift.v1';

function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(KEY)), climate); } catch { return INITIAL; }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }, [state]);

  const { scenarioId, situationId, soilId, waterMode, plantingId, weights, overrides, rainPct, tempDelta, currentId } = state;
  const inputs = useMemo(
    () => ({ climate, scenarioId, situationId, soilId, waterMode, plantingId, weights, overrides, rainPct, tempDelta }),
    [scenarioId, situationId, soilId, waterMode, plantingId, weights, overrides, rainPct, tempDelta],
  );
  const result = useMemo(() => evaluate(inputs), [inputs]);
  const unc = useMemo(() => uncertainty(inputs, { draws: 300, currentId }), [inputs, currentId]);
  const [tab, setTab] = useState('compare');
  const [step, setStep] = useState('welcome'); // farmer-flow screen; kept here so switching views does not lose it
  const farmer = state.mode === 'farmer';
  const t = useMemo(() => makeT(farmer ? state.lang : 'en'), [farmer, state.lang]);

  // Farmer mode: larger base text (see index.css) and the right document language.
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('farmer', farmer);
    el.lang = farmer && state.lang === 'fil' ? 'fil' : 'en';
  }, [farmer, state.lang]);

  const rankCount = result.ranked.filter((r) => !r.blocked).length;
  const scenarioLabel = climate.scenarios[scenarioId].label;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <Header mode={state.mode} lang={state.lang} t={t}
          onMode={(v) => dispatch({ type: 'set', key: 'mode', value: v })}
          onLang={(v) => dispatch({ type: 'set', key: 'lang', value: v })}
          onReset={() => dispatch({ type: 'resetAll' })} />
        {farmer ? (
          <FarmerFlow state={state} dispatch={dispatch} result={result} unc={unc} inputs={inputs} climate={climate} t={t} step={step} setStep={setStep} />
        ) : (
          <>
            <Notice />
            <DataBanners meta={climate.meta} rainSource={result.rainSource} scenarioId={scenarioId} />
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            {tab === 'calendar' && (
              <div role="tabpanel" id="panel-calendar" aria-labelledby="tab-calendar">
                <SeasonCalendar result={result} state={state} climate={climate} scenarioLabel={scenarioLabel} />
              </div>
            )}
            {tab === 'past' && (
              <div role="tabpanel" id="panel-past" aria-labelledby="tab-past">
                <PastSeasons climate={climate} inputs={inputs} />
              </div>
            )}
            {tab === 'community' && (
              <div role="tabpanel" id="panel-community" aria-labelledby="tab-community">
                <Community result={result} climate={climate} scenarioId={scenarioId} waterMode={waterMode} />
              </div>
            )}
            {tab === 'data' && (
              <div role="tabpanel" id="panel-data" aria-labelledby="tab-data">
                <DataMethods climate={climate} />
              </div>
            )}
            {/* Stays mounted so open why-cards and the price editor keep their state; the `hidden`
                class (not the attribute, which Tailwind's `grid` would override) removes it from view. */}
            <div role="tabpanel" id="panel-compare" aria-labelledby="tab-compare" className={tab === 'compare' ? 'grid gap-4 lg:grid-cols-[380px_1fr]' : 'hidden'}>
              <div className="space-y-4">
                <FieldForm state={state} dispatch={dispatch} />
                <PrioritySliders weights={weights} dispatch={dispatch} />
                <ScenarioPicker climate={climate} scenarioId={scenarioId} rainPct={rainPct} tempDelta={tempDelta} dispatch={dispatch} />
              </div>
              <div className="space-y-4">
                <section aria-labelledby="results">
                  <h2 id="results" className="mb-2 text-lg font-bold text-green-900">Results: {scenarioLabel}</h2>
                  <div className="space-y-3">
                    <UncertaintyPanel ranked={result.ranked} unc={unc} />
                    {result.ranked.map((r) => (
                      <RotationCard key={r.id} r={r} isCurrent={r.id === currentId} laborCap={state.laborCap} waterMode={waterMode}
                        topShare={unc.topShare[r.id]} beatsShare={unc.beatsCurrentShare[r.id]} draws={unc.draws}
                        card={buildWhyCard(r, { waterMode, scenarioLabel, rainSource: result.rainSource, soilLabel: SOILS[soilId].label, rankCount })} />
                    ))}
                  </div>
                </section>
                <EconomicsPanel overrides={overrides} dispatch={dispatch} />
              </div>
            </div>
          </>
        )}
        <Footer />
      </main>
    </div>
  );
}
