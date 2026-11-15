// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { useState } from 'react';
import { formatPhp } from '../engine/engine.js';
import { dateOfDay } from '../engine/content.js';
import ScoreBar from './ScoreBar.jsx';
import WhyCard from './WhyCard.jsx';

const pc = (x) => `${Math.round(100 * x)}%`;

export default function RotationCard({ r, isCurrent, laborCap, waterMode, topShare, beatsShare, card, draws }) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const overLabor = !r.blocked && r.laborMd > laborCap;
  return (
    <article className="card">
      <header className="flex flex-wrap items-center gap-2">
        {r.blocked
          ? <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-bold text-red-900">{tr('Blocked')}</span>
          : <span className="rounded-full bg-green-800 px-2.5 py-0.5 text-sm font-bold text-white" aria-label={`Rank ${r.rank}`}>#{r.rank}</span>}
        <h3 className="text-lg font-bold">{r.crop.name}</h3>
        {isCurrent && <span className="rounded bg-stone-200 px-2 py-0.5 text-sm font-semibold">{tr('Your current rotation')}</span>}
      </header>

      {r.blocked ? (
        <p className="mt-2 text-sm text-red-900">{r.crop.blockReason}</p>
      ) : (
        <>
          <div className="mt-3"><ScoreBar final={r.final} contributions={r.contributions} /></div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-4">
            <div><dt className="text-stone-600">{tr('Water need met')}</dt><dd className="font-semibold">
              {r.fallow ? 'no crop' : waterMode === 'irrigated' ? `100% with irrigation (about ${Math.round(r.irrigationMm).toLocaleString('en-PH')} mm pumped)` : pc(r.pctMet)}
              {!r.fallow && waterMode === 'irrigated' && <span className="block text-sm font-normal text-stone-600">Rain + soil water alone: {pc(r.pctMet)}</span>}
            </dd></div>
            <div><dt className="text-stone-600">{tr('Net per ha')}</dt><dd className="font-semibold">{formatPhp(r.net)}</dd></div>
            <div><dt className="text-stone-600">{tr('Labour')}</dt><dd className={`font-semibold ${overLabor ? 'text-red-800' : ''}`}>{r.laborMd.toLocaleString('en-PH')} man-days{overLabor && ' (above your limit)'}</dd></div>
            <div><dt className="text-stone-600">{tr('Harvest')}</dt><dd className="font-semibold">{r.fallow ? 'n/a' : `about ${dateOfDay(r.end)}`}</dd></div>
          </dl>
          {r.heatFlag && <p className="mt-2 text-sm text-amber-900">Heat flag: hot days (35 °C or more) likely during flowering.</p>}
          <p className="mt-2 text-sm text-stone-700">
            Top choice in {pc(topShare)} of {draws} plausible variations.
            {!isCurrent && <> Beats your current rotation in {pc(beatsShare)}.</>}
          </p>
        </>
      )}

      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="mt-3 min-h-[44px] rounded border border-stone-400 px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">
        {tr(open ? 'Hide why' : 'Why this result')}
      </button>
      {open && <WhyCard card={card} />}
    </article>
  );
}
