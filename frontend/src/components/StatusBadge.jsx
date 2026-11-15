// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { STATUS_LABELS } from '../engine/params.js';

const STYLE = {
  sourced: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'local-sourced': 'bg-emerald-100 text-emerald-900 border-emerald-300',
  secondary: 'bg-sky-100 text-sky-900 border-sky-300',
  assumption: 'bg-amber-100 text-amber-900 border-amber-300',
  illustrative: 'bg-stone-100 text-stone-800 border-stone-400',
  user: 'bg-violet-100 text-violet-900 border-violet-300',
};

// Not a parameter status: marks a number the user typed in.
const EXTRA_LABELS = { user: 'Your value' };

export default function StatusBadge({ status, title, size = 'text-sm' }) {
  return (
    <span title={title} className={`inline-block rounded border px-1.5 py-0.5 font-medium ${size} ${STYLE[status] ?? STYLE.illustrative}`}>
      {STATUS_LABELS[status] ?? EXTRA_LABELS[status] ?? status}
    </span>
  );
}
