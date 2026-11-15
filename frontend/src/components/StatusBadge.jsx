// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { STATUS_LABELS } from '../engine/params.js';

const STYLE = {
  sourced: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'local-sourced': 'bg-emerald-100 text-emerald-900 border-emerald-300',
  secondary: 'bg-sky-100 text-sky-900 border-sky-300',
  assumption: 'bg-amber-100 text-amber-900 border-amber-300',
  illustrative: 'bg-stone-100 text-stone-800 border-stone-400',
};

export default function StatusBadge({ status, title }) {
  return (
    <span title={title} className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${STYLE[status] ?? STYLE.illustrative}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
