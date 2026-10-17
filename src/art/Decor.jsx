// Decorative pieces in the "Little Minds" template style: wavy underlines,
// cloud dividers, loop arrows, spark strokes, blob photo frames and doodle
// buddies. Purely visual — all aria-hidden.

// Wavy underline under a highlighted word in a heading.
export function Squiggle({ children, tone = 'navy' }) {
  return <span className={`squiggle squiggle-${tone}`}>{children}</span>;
}

// Puffy cloud edge that sits at the bottom of the green hero.
export function CloudEdge({ className = '' }) {
  return (
    <svg className={`cloud-edge ${className}`} viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
      <path
        fill="var(--cream)"
        d="M0 160V96c40-30 92-38 132-14 22-46 90-62 132-22 30-40 96-44 128-4 40-30 100-20 120 18 26-22 70-26 96 0 22-48 96-62 136-20 44-34 112-28 136 18 30-26 84-24 108 6 30-42 104-48 140-6 38-36 104-30 128 14 34-28 92-22 112 16V160z"
      />
    </svg>
  );
}

// Hand-drawn loop with an arrow head (the yellow scribble in the hero).
export function LoopArrow({ size = 120, color = '#ffe14d', className = '' }) {
  return (
    <svg className={`doodle ${className}`} width={size} height={size * 0.75} viewBox="0 0 160 120" aria-hidden="true">
      <path
        d="M8 96c-6-30 20-50 36-30 14 20-8 46-18 30-12-20 22-52 44-34 18 16-4 44-14 30-10-14 18-50 46-42 22 6 34 18 46 6"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M140 18l14 8-12 10" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Little "shine" strokes next to a picture.
export function Sparks({ size = 56, color = '#ffe14d', className = '', flip = false }) {
  return (
    <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M10 30 L4 12 M24 24 L30 4 M30 38 L50 30" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// Curvy hand-drawn arrow (points right).
export function CurlyArrow({ size = 70, color = 'var(--navy)', className = '' }) {
  return (
    <svg className={`doodle ${className}`} width={size} height={size * 0.6} viewBox="0 0 100 60" aria-hidden="true">
      <path d="M4 40c18 14 40-20 60-6 10 7 18 6 30-4" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M84 24l11 6-7 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A "photo" frame: coloured card with a wavy blob shape behind the art.
// tone: yellow | coral | mint | green
export function BlobFrame({ tone = 'yellow', tilt = 0, className = '', children }) {
  return (
    <div className={`blob-frame tone-${tone} ${className}`} style={{ '--tilt': `${tilt}deg` }}>
      <svg className="blob-frame-bg" viewBox="0 0 300 360" preserveAspectRatio="none" aria-hidden="true">
        <path className="blob-a" d="M0 262c40-24 70 16 110 0s60-44 110-28 60 34 80 26V360H0z" />
        <path className="blob-b" d="M300 0v64c-26 22-60-8-92 8s-50-6-70-32S110 0 90 0z" />
      </svg>
      <div className="blob-frame-art">{children}</div>
    </div>
  );
}

// Doodle buddies that peek in from the page edges.
export function BunnyBuddy({ size = 90, className = '' }) {
  return (
    <svg className={`buddy ${className}`} width={size} height={size * 1.6} viewBox="0 0 90 144" aria-hidden="true">
      <path d="M22 50 C10 10 26 0 32 22 L36 50 M54 50 L58 18 C64 -2 80 8 68 50" fill="#8b7cf6" stroke="#2e2a6b" strokeWidth="3" />
      <path d="M8 90c0-30 16-44 37-44s37 14 37 44-14 34-37 34S8 120 8 90z" fill="#8b7cf6" stroke="#2e2a6b" strokeWidth="3" />
      <circle cx="32" cy="84" r="6" fill="#fff" stroke="#2e2a6b" strokeWidth="2.5" />
      <circle cx="56" cy="84" r="6" fill="#fff" stroke="#2e2a6b" strokeWidth="2.5" />
      <circle cx="33" cy="85" r="2.5" fill="#2e2a6b" />
      <circle cx="57" cy="85" r="2.5" fill="#2e2a6b" />
      <path d="M38 100q6 6 12 0" stroke="#2e2a6b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 124v16h-8M60 124v16h8" stroke="#2e2a6b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BlobBuddy({ size = 90, className = '' }) {
  return (
    <svg className={`buddy ${className}`} width={size} height={size * 1.4} viewBox="0 0 90 126" aria-hidden="true">
      <path d="M12 60C6 30 18 4 30 24c4-24 22-24 24 0 10-22 28-12 24 14 10 4 10 22 4 30 4 22-12 40-36 40S6 92 12 60z" fill="#ffe14d" stroke="#2e2a6b" strokeWidth="3" />
      <circle cx="34" cy="62" r="7" fill="#fff" stroke="#2e2a6b" strokeWidth="2.5" />
      <circle cx="58" cy="62" r="7" fill="#fff" stroke="#2e2a6b" strokeWidth="2.5" />
      <circle cx="36" cy="63" r="3" fill="#2e2a6b" />
      <circle cx="60" cy="63" r="3" fill="#2e2a6b" />
      <circle cx="24" cy="74" r="5" fill="#ff8fb1" opacity=".7" />
      <circle cx="68" cy="74" r="5" fill="#ff8fb1" opacity=".7" />
      <path d="M40 80q6 6 12 0" stroke="#2e2a6b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34 108v14M58 108v14M6 70l-6 14M84 66l6 -12" stroke="#2e2a6b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Flower-shaped avatar frame (used for players / leaderboard).
export function FlowerFrame({ children, size = 64, color = '#ff8fb1' }) {
  return (
    <span className="flower-frame" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path
          fill={color}
          d="M50 4c8 0 12 8 18 10s14-4 20 2 0 14 2 20 10 10 10 18-8 12-10 18 4 14-2 20-14 0-20 2-10 10-18 10-12-8-18-10-14 4-20-2 0-14-2-20S4 58 4 50s8-12 10-18-4-14 2-20 14 0 20-2S42 4 50 4z"
        />
      </svg>
      <span className="flower-inner">{children}</span>
    </span>
  );
}
