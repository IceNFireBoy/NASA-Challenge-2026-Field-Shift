// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
import { useState } from 'react';

// Number input that can be cleared and retyped. While the box is empty the app uses
// `emptyValue` (a default, or undefined to drop an override); the box refills on blur.
export default function NumField({ value, onChange, emptyValue = 0, min = 0, max = Infinity, ...rest }) {
  const [text, setText] = useState(null); // null = not being edited
  return (
    <input {...rest} type="number" min={min} max={Number.isFinite(max) ? max : undefined}
      value={text ?? String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const v = Number(raw);
        onChange(raw === '' || !Number.isFinite(v) ? emptyValue : Math.min(max, Math.max(min, v)));
      }}
      onBlur={() => setText(null)} />
  );
}
