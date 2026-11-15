// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
// Hand-made SVG pictures (no photos, no third-party art). All are decorative: aria-hidden.
const box = { width: '1em', height: '1em', viewBox: '0 0 48 48', 'aria-hidden': true, focusable: false };

export function ClayIcon() {
  return (
    <svg {...box}>
      <path d="M6 30c0-9 8-16 18-16s18 7 18 16c0 6-8 9-18 9S6 36 6 30z" fill="#8a5a3c" />
      <path d="M17 17l4 8-3 6M30 16l-3 9 5 7M23 25l4 3" fill="none" stroke="#4a2c1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LooseSoilIcon() {
  return (
    <svg {...box}>
      <path d="M5 38c4-9 10-14 19-14s15 5 19 14z" fill="#b98a5e" />
      {[[14, 22, 3], [24, 16, 3.5], [34, 21, 3], [19, 12, 2.5], [30, 10, 2.5], [10, 15, 2], [39, 14, 2]].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#8a5a3c" />
      ))}
    </svg>
  );
}

function MungbeanIcon() {
  return (
    <svg {...box}>
      <path d="M8 34C8 20 20 8 40 8c0 20-12 32-32 32z" fill="#2f8f4e" />
      {[[17, 31], [24, 24], [31, 17]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" fill="#c9e7b5" stroke="#1d6b36" strokeWidth="1.5" />)}
    </svg>
  );
}

function FallowIcon() {
  return (
    <svg {...box}>
      <rect x="4" y="26" width="40" height="16" rx="3" fill="#c9b79a" />
      <path d="M8 31h32M8 37h32" stroke="#8a7355" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <path d="M14 26v-7M14 21l-4-3M24 26v-9M24 20l4-3M34 26v-6M34 22l-3-3" fill="none" stroke="#8a7355" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CropIcon({ id }) {
  if (id === 'rice_mungbean') return <MungbeanIcon />;
  if (id === 'rice_fallow') return <FallowIcon />;
  return <span aria-hidden="true">{id === 'rice_corn' ? '🌽' : '🥜'}</span>;
}
