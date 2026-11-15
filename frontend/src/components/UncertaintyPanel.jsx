// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { ROTATION_COLORS } from '../lib/colors.js';

export default function UncertaintyPanel({ ranked, unc }) {
  const rows = ranked.filter((r) => !r.blocked).map((r) => ({ r, share: unc.topShare[r.id] }));
  const best = rows.reduce((a, b) => (b.share > a.share ? b : a), rows[0]);
  const close = best && best.share < 0.6;
  return (
    <section aria-labelledby="unc-t" className="rounded-lg border border-stone-300 bg-white p-4">
      <h2 id="unc-t" className="text-lg font-bold text-green-900">How sure is the top choice?</h2>
      <p className="text-sm text-stone-700">We re-ran the comparison {unc.draws} times, varying yields, prices, costs, crop durations, water-use factors, starting soil water and your weights within plausible ranges.</p>
      <ul className="mt-3 space-y-2">
        {rows.map(({ r, share }) => (
          <li key={r.id} className="grid grid-cols-[110px_1fr_48px] items-center gap-2 text-sm">
            <span className="font-medium">{r.crop.short}</span>
            <span className="h-4 overflow-hidden rounded bg-stone-200" aria-hidden="true"><span className="block h-full" style={{ width: `${share * 100}%`, background: ROTATION_COLORS[r.id] }} /></span>
            <span className="text-right font-bold tabular-nums">{Math.round(share * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-stone-600">Share of {unc.draws} runs in which each option ranked first.</p>
      {close && <p role="note" className="mt-2 rounded border border-amber-400 bg-amber-100 p-2 text-sm font-semibold text-amber-950">⚠ Close call: local judgement matters most here.</p>}
    </section>
  );
}
