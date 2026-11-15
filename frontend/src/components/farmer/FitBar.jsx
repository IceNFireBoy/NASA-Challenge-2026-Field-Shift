// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useEffect, useState } from 'react';

// Score bar that grows from the left. The fill is scaled (transform), never resized,
// and the motion is switched off in index.css under prefers-reduced-motion.
export default function FitBar({ value, label, strong = false }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const share = Math.min(100, Math.max(0, value)) / 100;
  return (
    <div>
      <div role="img" aria-label={label} className="h-4 overflow-hidden rounded-full bg-stone-200">
        <div className={`fit-fill h-full w-full rounded-full ${strong ? 'bg-green-800' : 'bg-stone-600'}`} style={{ transform: `scaleX(${on ? share : 0})` }} />
      </div>
      <p className="mt-1 font-semibold tabular-nums" aria-hidden="true">{label}</p>
    </div>
  );
}
