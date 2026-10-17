// Scramble Lab: read the meaning, job and type, then rebuild the word from
// letter tiles (tap tiles or type on a keyboard). Wrong guesses shake and
// you can try again; a hint locks in the next correct letter.
import { useEffect, useMemo, useState } from 'react';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { play } from '../game/sound.js';

export default function ScrambleQuestion({ q, answered, onAnswer }) {
  const tiles = useMemo(() => q.scrambled.split('').map((ch, i) => ({ ch, i })), [q.scrambled]);
  const [slots, setSlots] = useState([]); // tile indexes in order
  const [locked, setLocked] = useState(0); // letters locked by hints
  const [shake, setShake] = useState(0);
  const [tries, setTries] = useState(0);
  const used = new Set(slots);
  const guess = slots.map((i) => tiles[i].ch).join('');

  const finish = (correct) => {
    const points = correct ? (locked > 0 ? Math.max(1, q.points - 1) : q.points) : 0;
    onAnswer({ correct, points, max: q.points, given: guess });
  };

  // Check once every slot is filled.
  useEffect(() => {
    if (answered || slots.length !== q.word.length) return undefined;
    if (guess === q.word) {
      finish(true);
      return undefined;
    }
    play('wrong');
    setShake((s) => s + 1);
    setTries((t) => t + 1);
    const t = setTimeout(() => setSlots((s) => s.slice(0, locked)), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const add = (i) => {
    if (answered || used.has(i) || slots.length >= q.word.length) return;
    play('tap');
    setSlots((s) => [...s, i]);
  };
  const removeAt = (pos) => {
    if (answered || pos < locked) return;
    setSlots((s) => s.slice(0, pos));
  };

  const hint = () => {
    // Rebuild the slots so the first (locked + 1) letters are correct.
    const n = locked + 1;
    if (n > q.word.length) return;
    const taken = new Set();
    const next = [];
    for (let k = 0; k < n; k++) {
      const idx = tiles.findIndex((t, j) => t.ch === q.word[k] && !taken.has(j));
      taken.add(idx);
      next.push(idx);
    }
    setLocked(n);
    setSlots(next);
  };

  // Physical keyboard support.
  useEffect(() => {
    const onKey = (e) => {
      if (answered) return;
      if (e.key === 'Backspace') return removeAt(slots.length - 1);
      const ch = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return;
      const i = tiles.findIndex((t, j) => t.ch === ch && !used.has(j));
      if (i >= 0) add(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="scramble-q">
      <div className="clue-card">
        {q.icon && <OrganelleIcon id={q.icon} size={64} className="clue-icon" />}
        <dl>
          <div>
            <dt>Meaning</dt>
            <dd>{q.clue.meaning}</dd>
          </div>
          <div>
            <dt>Function</dt>
            <dd>{q.clue.fn}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{q.clue.kind}</dd>
          </div>
        </dl>
      </div>

      <p className="scrambled-word" aria-label={`Scrambled letters: ${q.scrambled.split('').join(' ')}`}>
        {q.scrambled}
      </p>

      <div key={shake} className={`slots ${shake ? 'shake' : ''} ${answered ? 'solved' : ''}`}>
        {q.word.split('').map((ch, pos) => {
          const tile = slots[pos];
          const letter = answered ? ch : tile !== undefined ? tiles[tile].ch : '';
          return (
            <button key={pos} className={`slot ${letter ? 'full' : ''} ${pos < locked ? 'locked' : ''}`} onClick={() => removeAt(pos)} disabled={answered} aria-label={letter ? `Letter ${letter}, tap to remove` : 'Empty'}>
              {letter}
            </button>
          );
        })}
      </div>

      {!answered && (
        <>
          <div className="tiles">
            {tiles.map((t, i) => (
              <button key={i} className={`tile ${used.has(i) ? 'used' : ''}`} onClick={() => add(i)} disabled={used.has(i)}>
                {t.ch}
              </button>
            ))}
          </div>
          {tries > 0 && <p className="try-again-text">Try again! ({tries} {tries === 1 ? 'try' : 'tries'})</p>}
          <div className="row center gap">
            <button className="btn ghost small" onClick={() => setSlots((s) => s.slice(0, locked))}>
              Clear
            </button>
            <button className="btn ghost small" onClick={hint} disabled={locked >= q.word.length - 1}>
              💡 Hint letter
            </button>
            <button className="btn ghost small" onClick={() => finish(false)}>
              Give up
            </button>
          </div>
        </>
      )}
    </div>
  );
}
