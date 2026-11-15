// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useTr } from '../lib/lang.jsx';

export default function Notice({ partial = false }) {
  const tr = useTr();
  return (
    <p role="note" className="callout text-sm">
      <strong>{tr('Decision support only.')}</strong> {tr('This tool highlights patterns in past NASA data to support, not replace, your judgement and local experts.')}
      {partial && <span className="block text-stone-700">{tr('Main labels are in Filipino; details, sources and numbers stay in English.')}</span>}
    </p>
  );
}
