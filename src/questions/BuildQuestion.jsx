// Build-a-Cell: tap the parts that belong in this cell. Each correct part
// pops into the diagram; parts that don't belong shake and explain why.
import { useMemo, useState } from 'react';
import CellDiagram, { CELLS } from '../art/CellDiagram.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { ORGANELLE_BY_ID } from '../data/organelles.js';
import { shuffle } from '../game/rng.js';
import { play } from '../game/sound.js';

const WHY_NOT = {
  animal: {
    cellWall: 'Animal cells have no cell wall — only a flexible membrane.',
    chloroplast: 'Animal cells don’t photosynthesise, so they have no chloroplasts.',
    vacuole: 'A large central vacuole is a plant-cell feature. Animal cells have only small, temporary vacuoles.',
  },
  plant: {
    centrosome: 'Most higher plant cells have no centrioles/centrosome like animal cells do.',
  },
};

export default function BuildQuestion({ q, answered, onAnswer }) {
  const tray = useMemo(() => shuffle([...q.needs, ...q.wrong]), [q.needs, q.wrong]);
  const [placed, setPlaced] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [msg, setMsg] = useState({ text: 'Tap a part to add it to the cell.', bad: false });
  const complete = placed.length === q.needs.length;

  const visible = complete
    ? CELLS[q.cell].order // reveal the full cell when finished
    : ['cytoplasm', ...placed, ...(placed.includes('nucleus') ? ['nucleolus'] : [])];

  const tap = (id) => {
    if (answered || complete || placed.includes(id) || rejected.includes(id)) return;
    if (q.needs.includes(id)) {
      play('pop');
      const next = [...placed, id];
      setPlaced(next);
      setMsg({ text: `${ORGANELLE_BY_ID[id].name} added! ${ORGANELLE_BY_ID[id].fn}`, bad: false });
      if (next.length === q.needs.length) {
        const points = Math.max(0, q.points - rejected.length);
        setTimeout(() => onAnswer({ correct: rejected.length === 0, points, max: q.points, partial: points > 0 }), 900);
      }
    } else {
      play('wrong');
      setRejected((r) => [...r, id]);
      setMsg({ text: WHY_NOT[q.cell][id] || 'That part doesn’t belong here.', bad: true });
    }
  };

  return (
    <div className="build-q">
      <h2 className="q-prompt">{q.prompt}</h2>
      <div className="build-layout">
        <div className={`q-art big build-cell ${complete ? 'complete' : ''}`}>
          <CellDiagram type={q.cell} visible={visible} labels={complete} />
          <div className="build-count">
            {placed.length}/{q.needs.length} parts
          </div>
        </div>
        <div className="tray" role="group" aria-label="Parts to add">
          {tray.map((id) => (
            <button
              key={id}
              className={`token ${placed.includes(id) ? 'placed' : ''} ${rejected.includes(id) ? 'rejected' : ''}`}
              onClick={() => tap(id)}
              disabled={answered || complete || placed.includes(id) || rejected.includes(id)}
            >
              <OrganelleIcon id={id} size={34} />
              <span>{ORGANELLE_BY_ID[id].name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className={`build-msg ${msg.bad ? 'bad' : ''}`} aria-live="polite">
        {msg.text}
      </p>
    </div>
  );
}
