// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import StatusBadge from '../StatusBadge.jsx';

const ICON = { water: '💧', soil: '🌱', income: '💰', work: '⏳' };
// Meaning is carried by the mark and the word, not by colour alone.
const MARK = { good: '✓', ok: '~', risk: '!', none: '–' };
const DOT = {
  good: 'bg-green-700 text-white',
  ok: 'bg-amber-400 text-stone-950',
  risk: 'bg-red-700 text-white',
  none: 'bg-stone-300 text-stone-900',
};
const CELL = {
  good: 'border-green-700 bg-green-50',
  ok: 'border-amber-600 bg-amber-50',
  risk: 'border-red-700 bg-red-50',
  none: 'border-stone-400 bg-stone-100',
};

export default function TrafficRow({ lights, t }) {
  return (
    <ul aria-label={t('light.title')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Object.entries(lights).map(([id, l]) => (
        <li key={id} className={`rounded-lg border-2 p-3 text-stone-950 ${CELL[l.level]}`}>
          <p className="flex items-center gap-2 font-semibold"><span aria-hidden="true">{ICON[id]}</span>{t(`light.${id}`)}</p>
          <p className="mt-1 flex items-center gap-2 font-bold">
            <span aria-hidden="true" className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold ${DOT[l.level]}`}>{MARK[l.level]}</span>
            {t(`light.${l.level}`)}
          </p>
          <p className="mt-1 break-words">{t(l.detail.key, l.detail.vars)}</p>
          {id === 'income' && l.level !== 'ok' && <p className="mt-1"><StatusBadge status="illustrative" size="text-base" /></p>}
        </li>
      ))}
    </ul>
  );
}
