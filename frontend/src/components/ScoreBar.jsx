// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { CRITERIA } from '../engine/engine.js';
import { CRITERION_COLORS } from '../lib/colors.js';

// Stacked bar: each segment is that criterion's points; total length = final score out of 100.
export default function ScoreBar({ final, contributions }) {
  const tr = useTr();
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-5 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="img"
          aria-label={`Score ${Math.round(final)} out of 100`}
        >
          {CRITERIA.map((c) => (
            <div key={c.id} style={{ width: `${contributions[c.id]}%`, background: CRITERION_COLORS[c.id] }} title={`${c.label}: ${contributions[c.id].toFixed(1)} pts`} />
          ))}
        </div>
        <span className="w-14 text-right text-lg font-bold tabular-nums">{Math.round(final)}<span className="text-sm font-normal text-stone-600">/100</span></span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-700">
        {CRITERIA.filter((c) => contributions[c.id] >= 0.5).map((c) => (
          <li key={c.id} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: CRITERION_COLORS[c.id] }} aria-hidden="true" />
            {tr(c.label)} {contributions[c.id].toFixed(0)}
          </li>
        ))}
      </ul>
    </div>
  );
}
