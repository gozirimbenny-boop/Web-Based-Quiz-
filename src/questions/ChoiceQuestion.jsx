// One component for every "pick an answer" question: multiple choice,
// true/false, riddles, fill the gap, odd one out, plant/animal/both and
// "name the highlighted part". Supports keyboard (1-4 / A-D) and voice.
import { useEffect, useRef, useState } from 'react';
import CellDiagram from '../art/CellDiagram.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Mic } from '../art/Icons.jsx';
import { canListen, listen, matchSpoken, speak, stopSpeaking } from '../game/voice.js';
import { play } from '../game/sound.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const SORT_ICONS = ['cellWall', 'lysosome', 'nucleus'];

export function speechFor(q) {
  const prompt = q.prompt.replace(/_{2,}/g, 'blank');
  if (q.layout === 'tf') return `True or false. ${prompt}`;
  if (q.layout === 'sort') return `${prompt}. Plant, animal, or both?`;
  return `${prompt} ${q.choices.map((c, i) => `${LETTERS[i]}: ${c}.`).join(' ')}`;
}

export default function ChoiceQuestion({ q, answered, onAnswer, voice }) {
  const [picked, setPicked] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const doneRef = useRef(false);

  const choose = (i) => {
    if (answered || doneRef.current) return;
    doneRef.current = true;
    stopSpeaking();
    setPicked(i);
    const correct = i === q.correct;
    const points = correct ? (q.hint && hintUsed ? q.points - 1 : q.points) : 0;
    onAnswer({ correct, points, max: q.points, given: q.choices[i] });
  };

  const voiceAnswer = async () => {
    if (answered || doneRef.current) return;
    setListening(true);
    setHeard('');
    const said = await listen();
    setListening(false);
    if (doneRef.current) return;
    if (!said.length) {
      setHeard('I didn’t catch that — tap the mic and try again.');
      return;
    }
    const i = matchSpoken(said, q.choices);
    setHeard(`You said: “${said[0]}”`);
    if (i >= 0) choose(i);
    else setHeard(`You said: “${said[0]}” — that doesn’t match an answer. Try again!`);
  };

  // Voice mode: read the question, then listen.
  useEffect(() => {
    if (!voice) return undefined;
    let cancelled = false;
    speak(speechFor(q)).then(() => {
      if (!cancelled && canListen) voiceAnswer();
    });
    return () => {
      cancelled = true;
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, voice]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      let i = '1234'.indexOf(k);
      if (i < 0 && q.layout !== 'tf' && q.layout !== 'sort') i = 'abcd'.indexOf(k);
      if (q.layout === 'tf') {
        if (k === 't') i = 0;
        if (k === 'f') i = 1;
      }
      if (i >= 0 && i < q.choices.length) choose(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const stateOf = (i) => {
    if (!answered) return '';
    if (i === q.correct) return 'right';
    if (i === picked) return 'wrong';
    return 'faded';
  };

  // Fill-the-gap: show the blank, then the right word once answered.
  const prompt =
    q.layout === 'fill' ? (
      <>
        {q.prompt.split(/_{2,}/).map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && <span className={`blank ${answered ? 'filled' : ''}`}>{answered ? q.choices[q.correct] : '?'}</span>}
          </span>
        ))}
      </>
    ) : (
      q.prompt
    );

  return (
    <div className={`choice-q layout-${q.layout || 'list'}`}>
      <h2 className="q-prompt">{prompt}</h2>

      {q.art && (
        <div className="q-art">
          <CellDiagram type={q.art.cell} highlight={q.art.highlight} dim />
        </div>
      )}

      {q.hint && !answered && (
        <div className="hint-row">
          {hintUsed ? (
            <p className="hint">💡 {q.hint}</p>
          ) : (
            <button className="btn ghost small" onClick={() => setHintUsed(true)}>
              💡 Show hint (worth 1 point instead of 2)
            </button>
          )}
        </div>
      )}

      <div className="choices" role="group" aria-label="Answers">
        {q.choices.map((c, i) => (
          <button
            key={c}
            className={`choice ${stateOf(i)} ${q.layout === 'tf' ? (i === 0 ? 'tf-true' : 'tf-false') : ''}`}
            onClick={() => {
              play('tap');
              choose(i);
            }}
            disabled={answered}
          >
            {q.layout === 'sort' ? (
              <OrganelleIcon id={SORT_ICONS[i]} size={30} />
            ) : q.layout !== 'tf' ? (
              <span className="letter">{LETTERS[i]}</span>
            ) : null}
            <span className="choice-text">{c}</span>
          </button>
        ))}
      </div>

      {voice && !answered && (
        <div className="voice-row">
          {canListen ? (
            <button className={`btn mic ${listening ? 'listening' : ''}`} onClick={voiceAnswer} disabled={listening}>
              <Mic active={listening} /> {listening ? 'Listening…' : 'Tap & say your answer'}
            </button>
          ) : (
            <p className="muted small">Your browser can read questions aloud but can’t hear answers — tap to answer instead. (Try Chrome or Edge.)</p>
          )}
          {heard && <p className="heard">{heard}</p>}
        </div>
      )}
    </div>
  );
}
