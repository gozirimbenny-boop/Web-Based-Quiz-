// Cell Explorer: tap any part of an animal or plant cell to learn about it,
// plus the Cell Library of every organelle.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CellDiagram, { CELLS } from '../art/CellDiagram.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Speaker } from '../art/Icons.jsx';
import { Squiggle } from '../art/Decor.jsx';
import { ORGANELLES, ORGANELLE_BY_ID, WHERE_LABEL } from '../data/organelles.js';
import { canSpeak, speak } from '../game/voice.js';
import { play } from '../game/sound.js';

function InfoCard({ o }) {
  return (
    <article className="info-card" key={o.id}>
      <div className="info-head">
        <OrganelleIcon id={o.id} size={72} className="pop-in" />
        <div>
          <h2>{o.name}</h2>
          <div className="row gap wrap">
            <span className="chip">{o.kind}</span>
            <span className={`chip where-${o.where}`}>{WHERE_LABEL[o.where]}</span>
          </div>
        </div>
        {canSpeak && (
          <button className="icon-btn" aria-label={`Read about the ${o.name} aloud`} onClick={() => speak(`${o.name}. ${o.fn} ${o.meaning} Fun fact: ${o.fact}`)}>
            <Speaker />
          </button>
        )}
      </div>
      <dl className="info-list">
        <div>
          <dt>Job</dt>
          <dd>{o.fn}</dd>
        </div>
        <div>
          <dt>Name meaning</dt>
          <dd>{o.meaning}</dd>
        </div>
        <div>
          <dt>Fun fact</dt>
          <dd>{o.fact}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function Learn() {
  const { organelleId } = useParams();
  const navigate = useNavigate();
  const [cell, setCell] = useState(() => (organelleId && ORGANELLE_BY_ID[organelleId]?.where === 'plant' ? 'plant' : 'animal'));
  const [labels, setLabels] = useState(false);
  const selected = ORGANELLE_BY_ID[organelleId] || null;

  const pick = (id) => {
    play('pop');
    navigate(`/learn/${id}`, { replace: true });
  };

  return (
    <div className="learn">
      <h1 className="display">
        Cell <Squiggle>Explorer.</Squiggle>
      </h1>
      <p className="muted">Tap any part of the cell to find out what it does.</p>

      <div className="row gap wrap explorer-controls">
        <div className="segmented" role="tablist">
          {['animal', 'plant'].map((c) => (
            <button key={c} role="tab" aria-selected={cell === c} className={cell === c ? 'on' : ''} onClick={() => setCell(c)}>
              {c === 'animal' ? 'Animal cell' : 'Plant cell'}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> Show labels
        </label>
      </div>

      <div className="explorer">
        <div className="explorer-cell">
          <CellDiagram type={cell} labels={labels} onPick={pick} highlight={selected && CELLS[cell].order.includes(selected.id) ? selected.id : undefined} />
        </div>
        <div className="explorer-info">
          {selected ? (
            <InfoCard o={selected} />
          ) : (
            <div className="info-card placeholder">
              <OrganelleIcon id="cytoplasm" size={64} />
              <p>Pick a part of the cell to see its job, what its name means, and a fun fact.</p>
            </div>
          )}
          {selected && !CELLS[cell].order.includes(selected.id) && (
            <p className="muted small">
              This part isn’t drawn on the {cell} cell diagram{selected.where !== 'both' ? ` — it’s typical of ${WHERE_LABEL[selected.where].toLowerCase()}` : ''}.
            </p>
          )}
        </div>
      </div>

      <h2 className="display section-title">
        Cell <Squiggle>Library.</Squiggle>
      </h2>
      <div className="library">
        {ORGANELLES.map((o) => (
          <button key={o.id} className={`lib-card ${selected?.id === o.id ? 'on' : ''}`} onClick={() => { pick(o.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <OrganelleIcon id={o.id} size={48} />
            <span className="lib-name">{o.name}</span>
            <span className="lib-fn">{o.match}</span>
          </button>
        ))}
      </div>

      <div className="card center">
        <p>Ready to test yourself?</p>
        <Link to="/play/label" className="btn primary">
          Play Label the Diagram
        </Link>
      </div>
    </div>
  );
}
