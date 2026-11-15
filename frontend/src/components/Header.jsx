// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { LANGS } from '../lib/i18n.js';

function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border-2 border-stone-500 bg-white p-0.5">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
          className={`pressable min-h-[2.75rem] rounded-lg px-3 font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500 ${value === o.id ? 'bg-green-800 text-white' : 'text-stone-800'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Header({ mode, lang, onMode, onLang, onReset, t }) {
  const farmer = mode === 'farmer';
  const modes = [{ id: 'farmer', label: t('mode.farmer') }, { id: 'expert', label: t('mode.expert') }];
  return (
    <header>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Field Shift</h1>
          <p className="font-medium">{farmer ? t('app.place') : 'San Mateo, Isabela, Philippines'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {farmer && <Segmented label={t('lang.label')} options={LANGS} value={lang} onChange={onLang} />}
          <Segmented label={t('mode.label')} options={modes} value={mode} onChange={onMode} />
          {!farmer && <button type="button" onClick={onReset} className="min-h-[44px] shrink-0 rounded border border-stone-400 bg-white px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Reset all settings</button>}
        </div>
      </div>
      {!farmer && <p className="text-stone-700">Compare dry-season options after rice using NASA climate data, crop science and your priorities.</p>}
    </header>
  );
}
