// "Cello" — the Cell Quest mascot. A friendly cell whose face changes with
// the mood of the game. mood: happy | wow | sad | think | cool | sleep

const FACES = {
  happy: (
    <>
      <ellipse cx="50" cy="56" rx="5" ry="6" fill="#1e293b" />
      <ellipse cx="74" cy="56" rx="5" ry="6" fill="#1e293b" />
      <circle cx="52" cy="54" r="1.8" fill="#fff" />
      <circle cx="76" cy="54" r="1.8" fill="#fff" />
      <path d="M52 70 q10 10 20 0" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  ),
  wow: (
    <>
      <circle cx="50" cy="55" r="7" fill="#fff" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="74" cy="55" r="7" fill="#fff" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="50" cy="55" r="3.5" fill="#1e293b" />
      <circle cx="74" cy="55" r="3.5" fill="#1e293b" />
      <ellipse cx="62" cy="74" rx="6" ry="7" fill="#1e293b" />
      <ellipse cx="62" cy="76" rx="3.5" ry="3" fill="#f472b6" />
    </>
  ),
  sad: (
    <>
      <path d="M44 54 l10 -4 M80 54 l-10 -4" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="60" rx="4.5" ry="5" fill="#1e293b" />
      <ellipse cx="74" cy="60" rx="4.5" ry="5" fill="#1e293b" />
      <path d="M52 78 q10 -9 20 0" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path className="tear" d="M80 66 q3 6 0 8 q-3 -2 0 -8z" fill="#60a5fa" />
    </>
  ),
  think: (
    <>
      <ellipse cx="50" cy="56" rx="4.5" ry="5.5" fill="#1e293b" />
      <ellipse cx="74" cy="54" rx="4.5" ry="5.5" fill="#1e293b" />
      <path d="M44 46 l10 -3 M70 44 l10 2" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M54 74 h16" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  cool: (
    <>
      <path d="M38 50 h48 v4 q-2 10 -12 10 q-9 0 -11 -9 h-2 q-2 9 -11 9 q-10 0 -12 -10z" fill="#1e293b" />
      <path d="M44 53 l6 0" stroke="#64748b" strokeWidth="2" />
      <path d="M52 72 q10 8 20 -1" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  ),
  sleep: (
    <>
      <path d="M45 57 q5 4 10 0 M69 57 q5 4 10 0" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="62" cy="74" rx="4" ry="3" fill="#1e293b" />
    </>
  ),
};

export default function Mascot({ mood = 'happy', size = 120, className = '' }) {
  return (
    <svg className={`mascot mascot-${mood} ${className}`} width={size} height={size} viewBox="0 0 124 124" aria-hidden="true">
      <g className="mascot-body">
        <path
          d="M62 10c26 0 50 18 50 48s-20 56-50 56S12 92 12 60 36 10 62 10z"
          fill="#d9f5f0"
          stroke="#147a7a"
          strokeWidth="5"
        />
        <ellipse cx="88" cy="32" rx="9" ry="5" fill="#ffc58f" stroke="#d9772a" strokeWidth="2" transform="rotate(-30 88 32)" />
        <circle cx="30" cy="88" r="6" fill="#b7f0d2" stroke="#22a06b" strokeWidth="2" />
        <circle cx="94" cy="92" r="4" fill="#fde2f0" stroke="#ec4899" strokeWidth="1.8" />
        <circle cx="40" cy="70" r="5" fill="#fda4af" opacity=".55" />
        <circle cx="84" cy="70" r="5" fill="#fda4af" opacity=".55" />
        {FACES[mood] || FACES.happy}
      </g>
    </svg>
  );
}
