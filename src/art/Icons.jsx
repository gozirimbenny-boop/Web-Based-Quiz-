// Small UI icons drawn in SVG (no icon font needed).

export function Flame({ size = 22, lit = true, className = '' }) {
  return (
    <svg className={`flame ${lit ? 'lit' : 'out'} ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-9.5z"
        fill={lit ? '#f97316' : '#94a3b8'}
      />
      <path d="M12 12c.5 2 2.5 3 2.5 5a2.5 2.5 0 0 1-5 0c0-1.5 1-2.5 2.5-5z" fill={lit ? '#fde047' : '#cbd5e1'} />
    </svg>
  );
}

export function Star({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  );
}

export function Clock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="13" r="9" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5l3 2M9 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Speaker({ size = 20, on = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? (
        <path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Mic({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill={active ? '#ef4444' : 'currentColor'} />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Trophy({ size = 96, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 8h28v12a14 14 0 0 1-28 0z" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
      <path d="M18 12H9a8 8 0 0 0 9 12M46 12h9a8 8 0 0 1-9 12" fill="none" stroke="#ca8a04" strokeWidth="3" />
      <rect x="28" y="33" width="8" height="10" fill="#eab308" />
      <rect x="20" y="43" width="24" height="7" rx="2" fill="#a16207" />
      <rect x="16" y="50" width="32" height="7" rx="2" fill="#854d0e" />
      <path d="M26 14l3 6M30 12l1 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

// Rank emblems — a growing microscope theme.
export function RankBadge({ level = 0, size = 44 }) {
  const colors = ['#94a3b8', '#22a06b', '#3b82c4', '#a855f7', '#f59e0b', '#ef4444'];
  const c = colors[Math.min(level, colors.length - 1)];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3l17 7v12c0 11-7 19-17 23C14 41 7 33 7 22V10z" fill={c} stroke="#0f172a" strokeOpacity=".25" strokeWidth="2" />
      <circle cx="24" cy="22" r="9" fill="#fff" opacity=".92" />
      <circle cx="24" cy="22" r="4.5" fill={c} />
      {Array.from({ length: Math.min(level, 5) }, (_, i) => (
        <circle key={i} cx={24 + (i - (Math.min(level, 5) - 1) / 2) * 6} cy="38" r="2" fill="#fff" />
      ))}
    </svg>
  );
}
