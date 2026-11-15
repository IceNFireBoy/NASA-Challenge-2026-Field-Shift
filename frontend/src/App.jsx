// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useEffect, useMemo, useReducer, useState } from 'react';
import climate from './data/climate.json';
import { evaluate, uncertainty, DEFAULT_WEIGHTS } from './engine/engine.js';
import { buildWhyCard } from './engine/content.js';
import { SOILS, DEFAULT_CURRENT } from './engine/params.js';
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
import Tabs from './components/Tabs.jsx';
import PastSeasons from './components/PastSeasons.jsx';
import SeasonCalendar from './components/SeasonCalendar.jsx';

const TABS = [
  { id: 'compare', label: 'Compare' },
  { id: 'calendar', label: 'Season calendar' },
  { id: 'past', label: 'Past seasons' },
];

const KEY = 'fieldshift.v1';
const INITIAL = {
  scenarioId: 'typical', situationId: 'after_wet_rice', soilId: 'loam', waterMode: 'rainfed',
  plantingId: null, currentId: DEFAULT_CURRENT, weights: DEFAULT_WEIGHTS, overrides: {},
  laborCap: 40, rainPct: 0, tempDelta: 0,
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...INITIAL, ...saved } : INITIAL;
  } catch { return INITIAL; }
}

function reducer(s, a) {
  switch (a.type) {
    case 'set': return { ...s, [a.key]: a.value };
    case 'situation': return { ...s, situationId: a.value, plantingId: null };
    case 'weight': return { ...s, weights: { ...s.weights, [a.key]: a.value } };
    case 'resetWeights': return { ...s, weights: DEFAULT_WEIGHTS };
    case 'override': {
      const cur = { ...(s.overrides[a.id] || {}) };
      if (a.value === undefined) delete cur[a.key]; else cur[a.key] = a.value;
      return { ...s, overrides: { ...s.overrides, [a.id]: cur } };
    }
    case 'resetAll': return INITIAL;
    case 'resetOverrides': return { ...s, overrides: {} };
    default: return s;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }, [state]);

  const inputs = useMemo(() => ({ climate, ...state }), [state]);
  const result = useMemo(() => evaluate(inputs), [inputs]);
  const unc = useMemo(() => uncertainty(inputs, { draws: 300, currentId: state.currentId }), [inputs, state.currentId]);
  const [tab, setTab] = useState('compare');
  const rankCount = result.ranked.filter((r) => !r.blocked).length;
  const scenarioLabel = climate.scenarios[state.scenarioId].label;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <Header onReset={() => dispatch({ type: 'resetAll' })} />
        <Notice />
        <DataBanners meta={climate.meta} rainSource={result.rainSource} scenarioId={state.scenarioId} />
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
        <div role="tabpanel" id="panel-compare" aria-labelledby="tab-compare" hidden={tab !== 'compare'} className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <FieldForm state={state} dispatch={dispatch} />
            <PrioritySliders weights={state.weights} dispatch={dispatch} />
            <ScenarioPicker climate={climate} scenarioId={state.scenarioId} rainPct={state.rainPct} tempDelta={state.tempDelta} dispatch={dispatch} />
          </div>
          <div className="space-y-4">
            <section aria-labelledby="results">
              <h2 id="results" className="mb-2 text-lg font-bold text-green-900">Results: {scenarioLabel}</h2>
              <div className="space-y-3">
                <UncertaintyPanel ranked={result.ranked} unc={unc} />
                {result.ranked.map((r) => (
                  <RotationCard key={r.id} r={r} isCurrent={r.id === state.currentId} laborCap={state.laborCap} waterMode={state.waterMode}
                    topShare={unc.topShare[r.id]} beatsShare={unc.beatsCurrentShare[r.id]} draws={unc.draws}
                    card={buildWhyCard(r, { waterMode: state.waterMode, scenarioLabel, rainSource: result.rainSource, soilLabel: SOILS[state.soilId].label, rankCount })} />
                ))}
              </div>
            </section>
            <EconomicsPanel overrides={state.overrides} dispatch={dispatch} />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
