// Match the Function: tap a structure, then tap its job.
// Each wrong pairing costs a point from this board.
import { useMemo, useState } from 'react';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { shuffle } from '../game/rng.js';
import { play } from '../game/sound.js';

export default function MatchQuestion({ q, answered, onAnswer }) {
  // Shuffle the jobs, making sure they never line up with the names.
  const rights = useMemo(() => {
    let r = shuffle(q.pairs);
    for (let i = 0; i < 10 && r.some((p, k) => p.id === q.pairs[k].id); i++) r = shuffle(q.pairs);
    return r;
  }, [q.pairs]);
  const [left, setLeft] = useState(null);
  const [done, setDone] = useState([]);
  const [bad, setBad] = useState(null); // { l, r } flashed red
  const [misses, setMisses] = useState(0);

  const tryPair = (l, r) => {
    if (l === r) {
      play('pop');
      const next = [...done, l];
      setDone(next);
      setLeft(null);
      if (next.length === q.pairs.length) {
        const points = Math.max(0, q.points - misses);
        setTimeout(() => onAnswer({ correct: misses === 0, points, max: q.points, partial: points > 0 }), 350);
      }
    } else {
      play('wrong');
      setMisses((m) => m + 1);
      setBad({ l, r });
      setLeft(null);
      setTimeout(() => setBad(null), 600);
    }
  };

  return (
    <div className="match-q">
      <h2 className="q-prompt">{q.prompt}</h2>
      <p className="muted small center">Tap a structure, then tap its job. Mistakes so far: {misses}</p>
      <div className="match-grid">
        <div className="match-col">
          {q.pairs.map((p) => (
            <button
              key={p.id}
              className={`match-item left ${left === p.id ? 'selected' : ''} ${done.includes(p.id) ? 'matched' : ''} ${bad?.l === p.id ? 'bad' : ''}`}
              disabled={answered || done.includes(p.id)}
              onClick={() => {
                play('tap');
                setLeft(p.id);
              }}
            >
              <OrganelleIcon id={p.id} size={30} />
              <span>{p.left}</span>
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((p) => (
            <button
              key={p.id}
              className={`match-item right ${done.includes(p.id) ? 'matched' : ''} ${bad?.r === p.id ? 'bad' : ''}`}
              disabled={answered || done.includes(p.id) || !left}
              onClick={() => tryPair(left, p.id)}
            >
              {p.right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
