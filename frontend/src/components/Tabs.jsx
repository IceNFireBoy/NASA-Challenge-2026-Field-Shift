// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';
import { useRef } from 'react';

export default function Tabs({ tabs, active, onChange }) {
  const tr = useTr();
  const refs = useRef({});
  const onKey = (e, i) => {
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    onChange(tabs[n].id);
    refs.current[tabs[n].id]?.focus();
  };
  return (
    <div role="tablist" aria-label="Views" className="flex gap-1 overflow-x-auto rounded-2xl bg-stone-200 p-1">
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => { refs.current[t.id] = el; }} type="button" role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls={`panel-${t.id}`}
          tabIndex={active === t.id ? 0 : -1} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}
          className={`min-h-[2.75rem] shrink-0 whitespace-nowrap rounded-xl px-4 text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${active === t.id ? 'bg-green-800 text-white shadow-sm' : 'text-stone-800'}`}>
          {tr(t.label)}
        </button>
      ))}
    </div>
  );
}
