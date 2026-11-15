// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useEffect, useRef, useState } from 'react';
import { ROTATION_IDS } from '../../engine/params.js';
import { MAX_PICKS, PRIORITIES } from '../../lib/farmer.js';
import { ClayIcon, LooseSoilIcon } from './icons.jsx';
import FarmerNotice from './FarmerNotice.jsx';
import Results from './Results.jsx';

const ORDER = ['welcome', 'q1', 'q2', 'q3', 'q4', 'q5', 'loading', 'results'];
const NUMBERED = ['q1', 'q2', 'q3', 'q4'];
const LOADING_MS = 1500;

const primary = 'pressable min-h-[3rem] rounded-xl bg-green-800 px-6 py-3 text-lg font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500 disabled:bg-stone-300 disabled:text-stone-600';
const secondary = 'pressable min-h-[3rem] rounded-xl border-2 border-stone-500 bg-white px-5 py-3 text-lg font-semibold text-stone-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function questions(state, dispatch, t) {
  const elNino = state.scenarioId !== 'typical' ? 'yes' : (state.elNino === 'yes' ? null : state.elNino);
  return {
    q1: { value: state.situationId, onPick: (v) => dispatch({ type: 'situation', value: v }), options: [
      { id: 'after_wet_rice', icon: '🌧️', label: t('q1.wet'), sub: t('q1.wet.sub') },
      { id: 'after_dry_rice', icon: '☀️', label: t('q1.dry'), sub: t('q1.dry.sub') },
    ] },
    q2: { value: state.waterMode, onPick: (v) => dispatch({ type: 'set', key: 'waterMode', value: v }), options: [
      { id: 'rainfed', icon: '🌦️', label: t('q2.rainfed'), sub: t('q2.rainfed.sub') },
      { id: 'irrigated', icon: '🚰', label: t('q2.irrigated'), sub: t('q2.irrigated.sub') },
    ] },
    q3: { value: state.soilId, hint: t('q3.hint'), onPick: (v) => dispatch({ type: 'set', key: 'soilId', value: v }), options: [
      { id: 'clay', icon: <ClayIcon />, label: t('q3.clay') },
      { id: 'loam', icon: <LooseSoilIcon />, label: t('q3.loam') },
    ] },
    q4: { multi: true, value: state.picks, hint: t('q4.hint'), onPick: (v) => dispatch({ type: 'picks', value: v }),
      options: PRIORITIES.map((p) => ({ id: p.id, icon: p.icon, label: t(`q4.${p.id}`), sub: t(`q4.${p.id}.sub`) })) },
    q5: { value: elNino, hint: t('q5.hint'), onPick: (v) => dispatch({ type: 'elNino', value: v }), options: [
      { id: 'yes', icon: '☀️', label: t('q5.yes') },
      { id: 'no', icon: '🌧️', label: t('q5.no') },
      { id: 'unsure', icon: '❓', label: t('q5.unsure') },
    ] },
  };
}

function PickCard({ name, multi, option, checked, disabled, onChange }) {
  return (
    <label className={`pick-card pressable flex min-h-[4.5rem] cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 focus-within:ring-4 focus-within:ring-green-500 ${checked ? 'border-green-800 bg-green-100' : 'border-stone-400 bg-white'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
      <input type={multi ? 'checkbox' : 'radio'} name={name} className="sr-only" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="flex h-12 w-12 shrink-0 items-center justify-center text-4xl leading-none">{typeof option.icon === 'string' ? <span aria-hidden="true">{option.icon}</span> : option.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold leading-snug">{option.label}</span>
        {option.sub && <span className="block text-stone-700">{option.sub}</span>}
      </span>
      <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 font-bold ${multi ? 'rounded-md' : 'rounded-full'} ${checked ? 'border-green-800 bg-green-800 text-white' : 'border-stone-500 bg-white text-transparent'}`}>✓</span>
    </label>
  );
}

function Loading({ lines, t, onDone }) {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), (i * LOADING_MS) / lines.length));
    timers.push(setTimeout(onDone, LOADING_MS));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-6 py-6">
      <ul aria-live="polite" className="space-y-3 text-lg">
        {lines.slice(0, shown).map((line, i) => (
          <li key={line} className="rise-in flex items-start gap-3 rounded-xl border border-stone-300 bg-white p-4">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-800 font-bold text-white">{i + 1}</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <button type="button" className={secondary} onClick={onDone}>{t('loading.skip')}</button>
    </div>
  );
}

export default function FarmerFlow({ state, dispatch, result, unc, inputs, climate, t, step, setStep }) {
  const [dir, setDir] = useState('fwd');
  const heading = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step]);

  const go = (to) => {
    const target = to === 'loading' && reducedMotion() ? 'results' : to;
    setDir(ORDER.indexOf(target) < ORDER.indexOf(step) ? 'back' : 'fwd');
    setStep(target);
  };
  const qs = questions(state, dispatch, t);
  const q = qs[step];
  const idx = ORDER.indexOf(step);

  let body;
  let title;
  if (step === 'welcome') {
    title = t('welcome.title');
    body = (
      <div className="space-y-4 pb-2 pt-4">
        <p className="text-lg text-stone-700">{t('welcome.sub')}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className={`${primary} text-xl sm:min-w-[14rem]`} onClick={() => go('q1')}>{t('welcome.start')} <span aria-hidden="true">→</span></button>
          {state.elNino && <button type="button" className={secondary} onClick={() => go('results')}>{t('welcome.seeLast')}</button>}
        </div>
        <FarmerNotice t={t} />
      </div>
    );
  } else if (step === 'loading') {
    title = t('loading.title');
    body = <Loading t={t} onDone={() => go('results')} lines={[
      t('loading.seasons', { n: climate.seasons.length }),
      t('loading.options', { n: ROTATION_IDS.length }),
      t('loading.whatifs', { n: unc.draws }),
    ]} />;
  } else if (step === 'results') {
    title = t('results.best');
    body = <Results state={state} dispatch={dispatch} result={result} unc={unc} inputs={inputs} climate={climate} t={t} onChangeAnswers={() => go('q1')} />;
  } else {
    title = t(`${step}.title`);
    const picked = q.multi ? q.value : [q.value];
    const toggle = (id) => {
      if (!q.multi) return q.onPick(id);
      return q.onPick(q.value.includes(id) ? q.value.filter((x) => x !== id) : [...q.value, id]);
    };
    const canNext = q.multi || q.value != null;
    body = (
      <div className="space-y-4">
        {q.hint && <p className="text-stone-700">{q.hint}</p>}
        <fieldset>
          <legend className="sr-only">{title}</legend>
          <div className="grid gap-3">
            {q.options.map((o) => (
              <PickCard key={o.id} name={step} multi={q.multi} option={o} checked={picked.includes(o.id)}
                disabled={q.multi && !picked.includes(o.id) && q.value.length >= MAX_PICKS} onChange={() => toggle(o.id)} />
            ))}
          </div>
        </fieldset>
        {q.multi && <p aria-live="polite" className="font-semibold">{t('q4.count', { n: q.value.length, max: MAX_PICKS })}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" className={secondary} onClick={() => go(ORDER[idx - 1])}><span aria-hidden="true">← </span>{t('nav.back')}</button>
          <button type="button" className={`${primary} flex-1`} disabled={!canNext} onClick={() => go(ORDER[idx + 1])}>
            {step === 'q5' ? t('nav.finish') : t('nav.next')}<span aria-hidden="true"> →</span>
          </button>
        </div>
      </div>
    );
  }

  const n = NUMBERED.indexOf(step) + 1;
  const progress = q ? (n ? n / NUMBERED.length : 1) : null;

  return (
    <section aria-labelledby="farmer-h" className="mx-auto max-w-2xl">
      {climate.meta.data_status === 'placeholder' && <p role="alert" className="mb-3 rounded border border-red-400 bg-red-100 p-3 font-semibold text-red-950">{t('placeholder')}</p>}
      {progress !== null && (
        <div className="mb-4">
          <p className="font-semibold text-green-900">{n ? t('step.of', { n, total: NUMBERED.length }) : t('step.last')}</p>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={n ? t('step.of', { n, total: NUMBERED.length }) : t('step.last')}
            className="mt-1 h-3 overflow-hidden rounded-full bg-stone-300">
            <div className="fit-fill h-full w-full rounded-full bg-green-800" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      )}
      <div key={step} className="step-enter" data-dir={dir}>
        <h2 id="farmer-h" ref={heading} tabIndex={-1} className={`font-bold leading-tight text-green-950 focus:outline-none ${step === 'welcome' ? 'text-3xl sm:text-4xl' : 'text-2xl'} ${step === 'results' ? 'sr-only' : 'mb-3'}`}>{title}</h2>
        {body}
      </div>
    </section>
  );
}
