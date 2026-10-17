// Two-Part (A-and-B) challenge: write both answers, reveal the model
// answers, then mark yourself — 1 point for A, 1 point for B.
import { useState } from 'react';

export default function TwoPartQuestion({ q, answered, onAnswer }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [marks, setMarks] = useState({ a: null, b: null });

  const submit = () => {
    const points = (marks.a ? 1 : 0) + (marks.b ? 1 : 0);
    onAnswer({ correct: points === 2, points, max: 2, partial: points === 1, given: `A: ${a} | B: ${b}` });
  };

  const Part = ({ k, label, question, value, set, model }) => (
    <div className="ab-part">
      <label htmlFor={`ab-${k}`}>
        <span className="ab-letter">{label}</span> {question}
      </label>
      <textarea id={`ab-${k}`} rows={2} value={value} onChange={(e) => set(e.target.value)} disabled={revealed} placeholder="Type your answer…" />
      {revealed && (
        <div className="model-answer">
          <strong>Model answer:</strong> {model}
          {!answered && (
            <div className="row gap">
              <button className={`btn small ${marks[k] === true ? 'ok' : 'ghost'}`} onClick={() => setMarks((m) => ({ ...m, [k]: true }))}>
                ✓ I got it
              </button>
              <button className={`btn small ${marks[k] === false ? 'no' : 'ghost'}`} onClick={() => setMarks((m) => ({ ...m, [k]: false }))}>
                ✗ Not quite
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="ab-q">
      <h2 className="q-prompt">Answer both parts in your own words.</h2>
      {Part({ k: 'a', label: 'A', question: q.a, value: a, set: setA, model: q.ansA })}
      {Part({ k: 'b', label: 'B', question: q.b, value: b, set: setB, model: q.ansB })}
      {!answered &&
        (!revealed ? (
          <button className="btn primary" onClick={() => setRevealed(true)}>
            Check my answers
          </button>
        ) : (
          <button className="btn primary" onClick={submit} disabled={marks.a === null || marks.b === null}>
            Submit marks
          </button>
        ))}
      <p className="muted small">Be honest — scientifically equivalent wording counts as correct!</p>
    </div>
  );
}
