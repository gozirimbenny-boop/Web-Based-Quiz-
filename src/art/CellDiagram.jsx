// Interactive animal / plant cell diagrams. Every part is its own <g> with a
// data-part id, so the same drawing powers the Cell Explorer, Label the
// Diagram (tap a part / name the highlighted part) and Build-a-Cell.
import { ORGANELLE_BY_ID } from '../data/organelles.js';

const pt = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const arc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
const dotsOnArc = (cx, cy, r, a0, a1, n) =>
  Array.from({ length: n }, (_, i) => pt(cx, cy, r, a0 + ((a1 - a0) * (i + 0.5)) / n));

const Mito = ({ x, y, rot = 0, rx = 22, ry = 12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse rx={rx} ry={ry} fill="#ffc58f" stroke="#d9772a" strokeWidth="2.5" />
    <path
      d={`M${-rx + 5} 4 l${(rx - 5) / 3} -8 ${(rx - 5) / 3} 8 ${(rx - 5) / 3} -8 ${(rx - 5) / 3} 8 ${(rx - 5) / 3} -8 ${(rx - 5) / 3} 8`}
      fill="none"
      stroke="#b5561a"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </g>
);

const Chloro = ({ x, y, rot = 0, rx = 21, ry = 12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse rx={rx} ry={ry} fill="#a7e3a1" stroke="#2f8a3c" strokeWidth="2.5" />
    {[-11, -2, 7].map((gx) =>
      [-6, -2, 2].map((gy) => <rect key={`${gx}${gy}`} x={gx} y={gy} width="6" height="2.8" rx="1" fill="#2f8a3c" />),
    )}
  </g>
);

const Golgi = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${-22 + i * 2} ${-12 + i * 7} q${22 - i * 2} ${-8 + i} ${44 - i * 4} 0`} fill="none" stroke={i % 2 ? '#f08a78' : '#ef6b57'} strokeWidth="4.5" strokeLinecap="round" />
    ))}
  </g>
);

const Ribos = ({ pts }) => (
  <>
    {pts.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="3.2" fill="#334155" />
        <circle cx={x} cy={y} r="9" fill="transparent" />
      </g>
    ))}
  </>
);

const Hit = ({ x, y, r }) => <circle cx={x} cy={y} r={r} fill="transparent" />;

// ---------- Animal cell (viewBox 0 0 400 300) ----------
const ANIMAL = {
  view: '0 0 400 300',
  order: ['cytoplasm', 'cytoskeleton', 'smoothER', 'roughER', 'nucleus', 'nucleolus', 'golgi', 'vesicle', 'lysosome', 'mitochondrion', 'centrosome', 'ribosome', 'cellMembrane'],
  parts: {
    cytoplasm: { label: [98, 118], draw: () => <ellipse cx="200" cy="150" rx="180" ry="130" fill="#e4f6f2" /> },
    cellMembrane: {
      label: [372, 205],
      draw: () => (
        <>
          <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="#147a7a" strokeWidth="6" />
          <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="#5fb8b0" strokeWidth="1.5" strokeDasharray="2 5" />
          <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="transparent" strokeWidth="20" />
        </>
      ),
      outline: () => <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="#9cc9c3" strokeWidth="2.5" strokeDasharray="8 8" />,
    },
    cytoskeleton: {
      label: [346, 96],
      draw: () => (
        <>
          <path d="M320 92 L368 150 M326 150 L366 98 M318 122 H372 M340 88 L352 160" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <Hit x={344} y={124} r={26} />
        </>
      ),
    },
    nucleus: {
      label: [185, 182],
      draw: () => (
        <>
          <circle cx="185" cy="150" r="46" fill="#d8ccff" stroke="#6d4fd1" strokeWidth="3" />
          <circle cx="185" cy="150" r="40" fill="none" stroke="#8b70e8" strokeWidth="1.2" strokeDasharray="3 4" />
          <path d="M160 168c5-4 10 3 15-1M165 132c4 3 8-1 12 1M200 172c4-2 8 2 12-1" stroke="#8b70e8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ),
    },
    nucleolus: { label: [197, 143], draw: () => <circle cx="197" cy="143" r="13" fill="#5b3fc4" /> },
    roughER: {
      label: [118, 150],
      draw: () => (
        <>
          {[60, 70, 80].map((r) => (
            <g key={r}>
              <path d={arc(185, 150, r, 125, 235)} fill="none" stroke="#3b82c4" strokeWidth="5" strokeLinecap="round" />
              {dotsOnArc(185, 150, r + 4, 125, 235, 9).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#1e293b" />)}
            </g>
          ))}
          <path d={arc(185, 150, 70, 125, 235)} fill="none" stroke="transparent" strokeWidth="34" />
        </>
      ),
    },
    smoothER: {
      label: [170, 252],
      draw: () => (
        <>
          <path d="M128 240 c12 -12 22 10 34 0 s22 10 34 0 s18 6 26 2" fill="none" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
          <path d="M134 256 c12 -10 22 8 34 0 s22 8 34 0" fill="none" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
          <Hit x={172} y={248} r={24} />
        </>
      ),
    },
    golgi: {
      label: [276, 132],
      draw: () => (
        <>
          <Golgi x={276} y={130} />
          <Hit x={276} y={134} r={24} />
        </>
      ),
    },
    vesicle: {
      label: [310, 175],
      draw: () => (
        <>
          {[[306, 168, 7], [292, 186, 5.5], [264, 98, 6]].map(([x, y, r]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={r} fill="#fde2f0" stroke="#ec4899" strokeWidth="2" />
              <circle cx={x} cy={y} r="12" fill="transparent" />
            </g>
          ))}
        </>
      ),
    },
    lysosome: {
      label: [240, 62],
      draw: () => (
        <>
          {[[240, 62, 11], [334, 205, 10]].map(([x, y, r]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={r} fill="#b7f0d2" stroke="#22a06b" strokeWidth="2.5" />
              <circle cx={x - 3} cy={y - 2} r="1.8" fill="#15803d" />
              <circle cx={x + 3} cy={y + 3} r="1.8" fill="#15803d" />
              <circle cx={x} cy={y} r="15" fill="transparent" />
            </g>
          ))}
        </>
      ),
    },
    mitochondrion: {
      label: [118, 70],
      draw: () => (
        <>
          <Mito x={118} y={70} rot={-25} />
          <Mito x={270} y={232} rot={15} />
          <Mito x={62} y={150} rot={80} rx={20} ry={11} />
        </>
      ),
    },
    centrosome: {
      label: [228, 210],
      draw: () => (
        <>
          <g transform="translate(228 210) rotate(-15)">
            <rect x="-12" y="-5" width="18" height="9" rx="2" fill="#fcd34d" stroke="#d97706" strokeWidth="1.6" />
            <rect x="2" y="-1" width="9" height="18" rx="2" fill="#fde68a" stroke="#d97706" strokeWidth="1.6" />
          </g>
          <Hit x={228} y={213} r={16} />
        </>
      ),
    },
    ribosome: {
      label: [328, 70],
      draw: () => <Ribos pts={[[328, 70], [154, 52], [252, 178], [212, 222], [98, 222], [300, 268], [74, 98], [344, 250]]} />,
    },
  },
};

// ---------- Plant cell (viewBox 0 0 400 300) ----------
const PLANT = {
  view: '0 0 400 300',
  order: ['cellWall', 'cytoplasm', 'vacuole', 'roughER', 'nucleus', 'nucleolus', 'golgi', 'chloroplast', 'mitochondrion', 'ribosome', 'cellMembrane'],
  parts: {
    cellWall: {
      label: [14, 150],
      draw: () => (
        <>
          <rect x="4" y="4" width="392" height="292" rx="24" fill="#d6edb0" stroke="#5e8f1f" strokeWidth="4" />
          <path d="M4 60h14M4 120h14M4 180h14M4 240h14M382 60h14M382 120h14M382 180h14M382 240h14M80 4v14M160 4v14M240 4v14M320 4v14M80 282v14M160 282v14M240 282v14M320 282v14" stroke="#7aa63a" strokeWidth="1.6" />
        </>
      ),
    },
    cytoplasm: { label: [296, 232], draw: () => <rect x="22" y="22" width="356" height="256" rx="16" fill="#eefaea" /> },
    cellMembrane: {
      label: [378, 150],
      draw: () => (
        <>
          <rect x="22" y="22" width="356" height="256" rx="16" fill="none" stroke="#147a7a" strokeWidth="3" />
          <rect x="22" y="22" width="356" height="256" rx="16" fill="none" stroke="transparent" strokeWidth="12" />
        </>
      ),
      outline: () => <rect x="22" y="22" width="356" height="256" rx="16" fill="none" stroke="#9cc9c3" strokeWidth="2.5" strokeDasharray="8 8" />,
    },
    vacuole: {
      label: [240, 140],
      draw: () => (
        <>
          <rect x="155" y="58" width="168" height="160" rx="34" fill="#cbe9fb" stroke="#3b9ad6" strokeWidth="3" />
          <path d="M200 90 q20 -8 40 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" strokeLinecap="round" />
        </>
      ),
    },
    nucleus: {
      label: [70, 112],
      draw: () => (
        <>
          <circle cx="82" cy="90" r="34" fill="#d8ccff" stroke="#6d4fd1" strokeWidth="3" />
          <circle cx="82" cy="90" r="29" fill="none" stroke="#8b70e8" strokeWidth="1.1" strokeDasharray="3 4" />
        </>
      ),
    },
    nucleolus: { label: [95, 82], draw: () => <circle cx="90" cy="86" r="10" fill="#5b3fc4" /> },
    roughER: {
      label: [126, 104],
      draw: () => (
        <>
          {[44, 52].map((r) => (
            <g key={r}>
              <path d={arc(82, 90, r, -40, 70)} fill="none" stroke="#3b82c4" strokeWidth="4.5" strokeLinecap="round" />
              {dotsOnArc(82, 90, r + 4, -40, 70, 6).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.7" fill="#1e293b" />)}
            </g>
          ))}
          <path d={arc(82, 90, 48, -40, 70)} fill="none" stroke="transparent" strokeWidth="26" />
        </>
      ),
    },
    golgi: {
      label: [82, 170],
      draw: () => (
        <>
          <Golgi x={82} y={170} s={0.85} />
          <Hit x={82} y={173} r={22} />
        </>
      ),
    },
    chloroplast: {
      label: [56, 238],
      draw: () => (
        <>
          <Chloro x={56} y={238} rot={15} />
          <Chloro x={128} y={252} rot={-8} />
          <Chloro x={250} y={250} />
          <Chloro x={352} y={78} rot={75} />
          <Chloro x={352} y={196} rot={80} />
        </>
      ),
    },
    mitochondrion: {
      label: [190, 254],
      draw: () => (
        <>
          <Mito x={190} y={254} rot={-10} rx={17} ry={9} />
          <Mito x={352} y={137} rot={90} rx={16} ry={9} />
        </>
      ),
    },
    ribosome: { label: [140, 44], draw: () => <Ribos pts={[[140, 44], [172, 38], [222, 38], [300, 40], [300, 262], [140, 212], [44, 140]]} /> },
  },
};

export const CELLS = { animal: ANIMAL, plant: PLANT };
export const cellPartIds = (type) => CELLS[type].order;

export default function CellDiagram({
  type = 'animal',
  highlight,
  dim = false,
  visible,
  labels = false,
  correct,
  wrong,
  selected,
  onPick,
  className = '',
  title,
}) {
  const cell = CELLS[type];
  const isVisible = (id) => !visible || visible.includes(id);
  return (
    <svg
      className={`cell-diagram ${onPick ? 'pickable' : ''} ${className}`}
      viewBox={cell.view}
      role="img"
      aria-label={title || `${type === 'animal' ? 'Animal' : 'Plant'} cell diagram`}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {cell.order.map((id) => {
        const part = cell.parts[id];
        if (!isVisible(id)) return part.outline ? <g key={id} className="part-outline">{part.outline()}</g> : null;
        const cls = [
          'part',
          highlight === id && 'hl',
          dim && highlight && highlight !== id && 'dimmed',
          correct === id && 'is-correct',
          wrong === id && 'is-wrong',
          selected === id && 'is-selected',
          visible && 'pop',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <g
            key={id}
            data-part={id}
            className={cls}
            onClick={
              onPick
                ? (e) => {
                    e.stopPropagation();
                    onPick(id);
                  }
                : undefined
            }
          >
            <title>{ORGANELLE_BY_ID[id]?.name}</title>
            {part.draw()}
          </g>
        );
      })}
      {highlight && cell.parts[highlight] && (
        <g className="hl-ring" pointerEvents="none">
          <circle cx={cell.parts[highlight].label[0]} cy={cell.parts[highlight].label[1]} r="26" fill="none" stroke="#facc15" strokeWidth="4" />
        </g>
      )}
      {labels &&
        cell.order
          .filter(isVisible)
          .map((id) => {
            const [x, y] = cell.parts[id].label;
            const name = ORGANELLE_BY_ID[id].name;
            const w = name.length * 6.2 + 12;
            return (
              <g key={`lbl-${id}`} className="diagram-label" pointerEvents="none">
                <rect x={x - w / 2} y={y - 9} width={w} height="18" rx="9" fill="rgba(15,40,50,.82)" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                  {name}
                </text>
              </g>
            );
          })}
    </svg>
  );
}
