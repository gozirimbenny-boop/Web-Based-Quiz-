import { Link } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import { Squiggle } from '../art/Decor.jsx';
import { useProgress } from '../game/progress.jsx';
import { exists, summary } from '../game/catalog.js';

export default function Mistakes() {
  const p = useProgress();
  const list = p.mistakes.filter(exists);
  return (
    <div className="mistakes-page">
      <h1 className="display">
        Learn from <Squiggle>Mistakes.</Squiggle>
      </h1>
      {list.length === 0 ? (
        <div className="card center">
          <Mascot mood="cool" size={100} />
          <h2>Nothing to fix!</h2>
          <p className="muted">Questions you miss will appear here with the right answer and an explanation.</p>
          <Link to="/play" className="btn primary">
            Play a game
          </Link>
        </div>
      ) : (
        <>
          <p className="muted">
            {list.length} question{list.length === 1 ? '' : 's'} to review. Get one right in any game and it disappears from this list.
          </p>
          <Link to="/play/mistakes" className="btn primary big">
            Practise these now
          </Link>
          <ul className="review">
            {list.map((id) => {
              const s = summary(id);
              return (
                <li key={id} className="review-item">
                  <p className="review-q">{s.prompt}</p>
                  <p className="review-answer">
                    Answer: <strong>{s.answer}</strong>
                  </p>
                  {s.explain && <p className="muted small">{s.explain}</p>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
