// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
export default function Header({ onReset }) {
  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold text-green-900">Field Shift</h1>
        <button type="button" onClick={onReset} className="min-h-[44px] shrink-0 rounded border border-stone-400 bg-white px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Reset all settings</button>
      </div>
      <p className="font-medium">San Mateo, Isabela, Philippines</p>
      <p className="text-stone-700">Compare dry-season options after rice using NASA climate data, crop science and your priorities.</p>
    </header>
  );
}
