// Hand-drawn SVG icon for each organelle (64x64). Used for mode cards,
// the Cell Library, avatars, Build-a-Cell tokens and question art.

const ICONS = {
  nucleus: (
    <>
      <circle cx="32" cy="32" r="26" fill="#d8ccff" stroke="#6d4fd1" strokeWidth="3" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#8b70e8" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="36" cy="29" r="9" fill="#5b3fc4" />
      <path d="M18 38c4-3 8 2 12-1M22 22c3 2 6-1 9 1" stroke="#8b70e8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  nucleolus: (
    <>
      <circle cx="32" cy="32" r="26" fill="#ece6ff" stroke="#b9a7f5" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="32" cy="32" r="14" fill="#5b3fc4" />
      <circle cx="27" cy="27" r="4" fill="#8b70e8" />
      <circle cx="37" cy="36" r="2.5" fill="#8b70e8" />
    </>
  ),
  mitochondrion: (
    <>
      <ellipse cx="32" cy="32" rx="28" ry="17" fill="#ffc58f" stroke="#d9772a" strokeWidth="3" transform="rotate(-20 32 32)" />
      <path d="M12 38 l6-12 6 14 6-14 6 14 6-14 6 12" fill="none" stroke="#b5561a" strokeWidth="2.6" strokeLinejoin="round" transform="rotate(-20 32 32)" />
    </>
  ),
  ribosome: (
    <>
      <circle cx="32" cy="26" r="15" fill="#64748b" />
      <ellipse cx="32" cy="44" rx="11" ry="8" fill="#334155" />
      <path d="M8 50 q12-6 24 0 t24 0" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="21" r="3" fill="#94a3b8" />
    </>
  ),
  roughER: (
    <>
      {[14, 26, 38, 50].map((y) => (
        <path key={y} d={`M6 ${y} q8-7 16 0 t16 0 t16 0 t6 -2`} fill="none" stroke="#3b82c4" strokeWidth="5" strokeLinecap="round" />
      ))}
      {[10, 20, 30, 40, 50].map((x) =>
        [10, 22, 34, 46].map((y) => <circle key={`${x}-${y}`} cx={x + ((y / 2) % 6)} cy={y} r="1.8" fill="#1e293b" />),
      )}
    </>
  ),
  smoothER: (
    <>
      <path d="M8 18 c10-10 18 10 28 0 s16 4 20 10" fill="none" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />
      <path d="M6 36 c10 -8 16 10 26 2 s14 -8 26 2" fill="none" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />
      <path d="M12 52 c8 -6 14 4 22 -2 s12 -2 18 2" fill="none" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  golgi: (
    <>
      {[16, 25, 34, 43].map((y, i) => (
        <path key={y} d={`M${10 + i * 2} ${y} q22 ${-9 + i} ${44 - i * 4} 0`} fill="none" stroke={i % 2 ? '#f08a78' : '#ef6b57'} strokeWidth="5.5" strokeLinecap="round" />
      ))}
      <circle cx="54" cy="46" r="4" fill="#f9a8d4" stroke="#ef6b57" strokeWidth="1.5" />
      <circle cx="47" cy="54" r="3" fill="#f9a8d4" stroke="#ef6b57" strokeWidth="1.5" />
      <circle cx="9" cy="48" r="3" fill="#f9a8d4" stroke="#ef6b57" strokeWidth="1.5" />
    </>
  ),
  lysosome: (
    <>
      <circle cx="32" cy="32" r="24" fill="#b7f0d2" stroke="#22a06b" strokeWidth="3" />
      {[[24, 24], [38, 22], [30, 36], [42, 38], [22, 40], [34, 46]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x - 3} ${y} l3 -3 3 3 -3 3z`} fill="#15803d" />
      ))}
    </>
  ),
  vesicle: (
    <>
      <circle cx="32" cy="32" r="22" fill="#fde2f0" stroke="#ec4899" strokeWidth="3" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#f9a8d4" strokeWidth="2" />
      <circle cx="27" cy="29" r="4" fill="#ef6b57" />
      <circle cx="37" cy="35" r="3.5" fill="#f59e4b" />
      <circle cx="30" cy="39" r="2.5" fill="#a78bfa" />
    </>
  ),
  cellMembrane: (
    <>
      {[6, 14, 22, 30, 38, 46, 54].map((x) => (
        <g key={x}>
          <circle cx={x + 2} cy="14" r="4.2" fill="#147a7a" />
          <path d={`M${x} 18 v12 M${x + 4} 18 v12`} stroke="#5fb8b0" strokeWidth="1.6" />
          <path d={`M${x} 34 v12 M${x + 4} 34 v12`} stroke="#5fb8b0" strokeWidth="1.6" />
          <circle cx={x + 2} cy="50" r="4.2" fill="#147a7a" />
        </g>
      ))}
      <rect x="25" y="10" width="10" height="44" rx="5" fill="#f59e4b" opacity=".9" />
    </>
  ),
  cytoplasm: (
    <>
      <path d="M10 30c0-14 14-22 26-20s20 10 18 22-12 22-26 20S10 44 10 30z" fill="#bfe9e3" stroke="#5fb8b0" strokeWidth="2.5" />
      {[[22, 24], [38, 20], [30, 34], [44, 38], [20, 42], [36, 46]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill="#5fb8b0" opacity=".7" />
      ))}
    </>
  ),
  cytoskeleton: (
    <>
      <path d="M6 14 L58 44 M10 52 L54 8 M4 32 H60 M20 4 L36 60 M44 4 L28 60" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 14 L58 44 M10 52 L54 8" stroke="#475569" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="32" cy="31" r="4" fill="#475569" />
    </>
  ),
  centrosome: (
    <>
      <g transform="rotate(-15 32 32)">
        <rect x="10" y="22" width="26" height="12" rx="3" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
        {[14, 19, 24, 29].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="34" stroke="#d97706" strokeWidth="1.5" />)}
      </g>
      <g transform="rotate(75 38 40)">
        <rect x="26" y="34" width="26" height="12" rx="3" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
        {[30, 35, 40, 45].map((x) => <line key={x} x1={x} y1="34" x2={x} y2="46" stroke="#d97706" strokeWidth="1.5" />)}
      </g>
    </>
  ),
  chloroplast: (
    <>
      <ellipse cx="32" cy="32" rx="28" ry="17" fill="#a7e3a1" stroke="#2f8a3c" strokeWidth="3" />
      {[16, 28, 40].map((x, i) => (
        <g key={x}>
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={x} y={22 + k * 5 + (i === 1 ? -2 : 1)} width="9" height="3.6" rx="1.5" fill="#2f8a3c" />
          ))}
        </g>
      ))}
      <path d="M25 30h3M37 34h3" stroke="#3fa34d" strokeWidth="2" />
    </>
  ),
  cellWall: (
    <>
      <rect x="5" y="5" width="54" height="54" rx="8" fill="#e3f4c6" stroke="#5e8f1f" strokeWidth="5" />
      <rect x="13" y="13" width="38" height="38" rx="5" fill="#f3fbe6" stroke="#8bbf3f" strokeWidth="2" />
      <path d="M5 20h8M5 34h8M5 48h8M51 16h8M51 30h8M51 44h8M18 5v8M32 5v8M46 5v8M24 51v8M40 51v8" stroke="#5e8f1f" strokeWidth="1.8" />
    </>
  ),
  vacuole: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="14" fill="#cbe9fb" stroke="#3b9ad6" strokeWidth="3" />
      <path d="M32 20c6 8 9 13 9 17a9 9 0 0 1-18 0c0-4 3-9 9-17z" fill="#7cc4f2" stroke="#3b9ad6" strokeWidth="2" />
      <ellipse cx="29" cy="37" rx="2" ry="3" fill="#fff" opacity=".8" />
    </>
  ),
};

export default function OrganelleIcon({ id, size = 48, title, className = '' }) {
  return (
    <svg
      className={`org-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {ICONS[id] || <circle cx="32" cy="32" r="20" fill="#ccc" />}
    </svg>
  );
}
