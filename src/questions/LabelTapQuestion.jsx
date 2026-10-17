// Label the diagram: tap the named part on the cell.
import { useState } from 'react';
import CellDiagram from '../art/CellDiagram.jsx';
import { ORGANELLE_BY_ID } from '../data/organelles.js';

export default function LabelTapQuestion({ q, answered, onAnswer }) {
  const [tapped, setTapped] = useState(null);
  const pick = (id) => {
    if (answered) return;
    setTapped(id);
    onAnswer({ correct: id === q.target, points: id === q.target ? q.points : 0, max: q.points, given: ORGANELLE_BY_ID[id]?.name });
  };
  return (
    <div className="label-q">
      <h2 className="q-prompt">{q.prompt}</h2>
      <div className="q-art big">
        <CellDiagram
          type={q.cell}
          onPick={answered ? undefined : pick}
          correct={answered ? q.target : undefined}
          wrong={answered && tapped !== q.target ? tapped : undefined}
          highlight={answered ? q.target : undefined}
        />
      </div>
      {answered && tapped !== q.target && tapped && (
        <p className="muted center">
          You tapped the <strong>{ORGANELLE_BY_ID[tapped].name}</strong>. The glowing part is the {ORGANELLE_BY_ID[q.target].name}.
        </p>
      )}
      {!answered && <p className="muted center small">Tip: zoom in on small parts — ribosomes are the tiny dark dots.</p>}
    </div>
  );
}
