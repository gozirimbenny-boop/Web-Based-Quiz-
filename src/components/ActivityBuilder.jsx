// The form a teacher uses to set up an assignment or a live room:
// questions from a game mode, from chosen topics, or hand-picked; an optional
// study step; due date and timing; and (under "More options") per-student
// shuffling and retakes.
import { useMemo, useState } from 'react';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { ORGANELLES } from '../data/organelles.js';
import { MODE_BY_ID } from '../game/modes.js';
import { ALL_IDS, QUESTION_TYPES, isChoiceQuestion, summary, typeOf } from '../game/catalog.js';
import { ACTIVITY_MODES, LIVE_MODES, countAvailable, resolveQuestionIds } from '../game/activity.js';
import { randomSeed } from '../game/rng.js';

function TopicChips({ value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="topic-chips">
      {ORGANELLES.map((o) => (
        <button type="button" key={o.id} className={`topic-chip ${value.includes(o.id) ? 'on' : ''}`} onClick={() => toggle(o.id)} aria-pressed={value.includes(o.id)}>
          <OrganelleIcon id={o.id} size={22} /> {o.name}
        </button>
      ))}
    </div>
  );
}

export default function ActivityBuilder({ live = false, onCreate, onCancel }) {
  const modes = live ? LIVE_MODES : ACTIVITY_MODES;
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [source, setSource] = useState('mode');
  const [mode, setMode] = useState(modes[0]);
  const [count, setCount] = useState(10);
  const [topics, setTopics] = useState([]);
  const [types, setTypes] = useState([]);
  const [picked, setPicked] = useState([]);
  const [search, setSearch] = useState('');
  const [pickType, setPickType] = useState('');
  const [studyOn, setStudyOn] = useState(false);
  const [study, setStudy] = useState([]);
  const [due, setDue] = useState('');
  const [timePer, setTimePer] = useState(live ? 20 : 0);
  const [shuffle, setShuffle] = useState(false);
  const [retake, setRetake] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const available = source === 'topics' ? countAvailable(topics, types, live) : null;
  const bank = useMemo(
    () =>
      ALL_IDS.filter((id) => (!live || isChoiceQuestion(id)) && (!pickType || typeOf(id) === pickType))
        .map((id) => ({ id, ...summary(id) }))
        .filter((q) => !search || `${q.prompt} ${q.answer}`.toLowerCase().includes(search.toLowerCase())),
    [live, pickType, search],
  );

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!title.trim()) return setErr('Give it a title.');
    if (source === 'topics' && !topics.length) return setErr('Pick at least one topic.');
    if (source === 'pick' && !picked.length) return setErr('Tick at least one question.');
    const seed = randomSeed();
    const config = { source, mode, count: Number(count) || 10, topics, types, picked };
    const questionIds = resolveQuestionIds(config, seed, { live });
    if (!questionIds.length) return setErr('That selection has no questions. Try other topics or question types.');
    setBusy(true);
    await onCreate({
      title: title.trim().slice(0, 60),
      instructions: instructions.trim().slice(0, 500),
      config,
      questionIds,
      seed,
      study: studyOn ? (study.length ? study : topics) : [],
      dueAt: due ? new Date(due) : null,
      timePer: Number(timePer) || 0,
      shuffle,
      retake,
    });
    setBusy(false);
  };

  return (
    <form className="builder" onSubmit={submit}>
      <h3>{live ? 'Start a live game' : 'New assignment'}</h3>
      <label className="field">
        <span>Title</span>
        <input className="input" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder={live ? 'e.g. Friday organelle showdown' : 'e.g. Week 3 — Energy organelles'} />
      </label>
      {!live && (
        <label className="field">
          <span>Instructions (optional)</span>
          <textarea className="input" rows={2} value={instructions} maxLength={500} onChange={(e) => setInstructions(e.target.value)} placeholder="What should students focus on?" />
        </label>
      )}

      <div className="field">
        <span>Questions</span>
        <div className="segmented wide" role="tablist">
          {[
            ['mode', 'Game mode'],
            ['topics', 'By topic'],
            ['pick', 'Hand-pick'],
          ].map(([id, label]) => (
            <button type="button" key={id} role="tab" aria-selected={source === id} className={source === id ? 'on' : ''} onClick={() => setSource(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {source === 'mode' && (
        <div className="row gap wrap">
          <label className="field grow">
            <span>Game mode</span>
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
              {modes.map((m) => (
                <option key={m} value={m}>
                  {MODE_BY_ID[m].name}
                </option>
              ))}
            </select>
          </label>
          <label className="field small-field">
            <span>Max questions</span>
            <input className="input" type="number" min={1} max={60} value={count} onChange={(e) => setCount(e.target.value)} />
          </label>
        </div>
      )}

      {source === 'topics' && (
        <>
          <div className="field">
            <span>Topics</span>
            <TopicChips value={topics} onChange={setTopics} />
          </div>
          <div className="field">
            <span>Question types (none ticked = all)</span>
            <div className="check-row">
              {QUESTION_TYPES.filter((t) => !live || ['mcq', 'tf', 'riddle', 'fill', 'odd', 'sort', 'label'].includes(t.id)).map((t) => (
                <label key={t.id} className="check">
                  <input type="checkbox" checked={types.includes(t.id)} onChange={(e) => setTypes(e.target.checked ? [...types, t.id] : types.filter((x) => x !== t.id))} /> {t.label}
                </label>
              ))}
            </div>
          </div>
          <label className="field small-field">
            <span>Max questions</span>
            <input className="input" type="number" min={1} max={60} value={count} onChange={(e) => setCount(e.target.value)} />
          </label>
          <p className="muted small">{topics.length ? `${available} matching question${available === 1 ? '' : 's'} in the bank.` : 'Pick topics to see how many questions match.'}</p>
        </>
      )}

      {source === 'pick' && (
        <div className="field">
          <div className="row gap wrap">
            <input className="input grow" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" />
            <select className="input small-field" value={pickType} onChange={(e) => setPickType(e.target.value)}>
              <option value="">All types</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <p className="muted small">
            {picked.length} selected · {bank.length} shown{picked.length > 0 && <button type="button" className="link" onClick={() => setPicked([])}> · clear</button>}
          </p>
          <ul className="pick-list">
            {bank.slice(0, 200).map((q) => (
              <li key={q.id}>
                <label className="check">
                  <input type="checkbox" checked={picked.includes(q.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, q.id] : picked.filter((x) => x !== q.id))} />
                  <span>
                    {q.prompt}
                    <small className="muted"> — {q.answer}</small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!live && (
        <div className="field">
          <label className="check">
            <input type="checkbox" checked={studyOn} onChange={(e) => setStudyOn(e.target.checked)} /> Study first — students read organelle cards before the quiz unlocks
          </label>
          {studyOn && (
            <>
              <p className="muted small">Cards to study{source === 'topics' ? ' (none picked = the topics above)' : ''}:</p>
              <TopicChips value={study} onChange={setStudy} />
            </>
          )}
        </div>
      )}

      <div className="row gap wrap">
        {!live && (
          <label className="field grow">
            <span>Due (optional)</span>
            <input className="input" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        )}
        <label className="field small-field">
          <span>Time per question</span>
          <select className="input" value={timePer} onChange={(e) => setTimePer(e.target.value)}>
            {!live && <option value={0}>No limit</option>}
            {[10, 15, 20, 30, 45, 60].map((s) => (
              <option key={s} value={s}>
                {s} seconds
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Live games show one question to the whole room, so the order is
          always shared there; these options are for assignments only. */}
      {!live && (
        <details className="more-options">
          <summary>More options</summary>
          <label className="check">
            <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} /> Shuffle question and answer order for each student
          </label>
          <label className="check">
            <input type="checkbox" checked={retake} onChange={(e) => setRetake(e.target.checked)} /> Allow students to retake (latest attempt counts)
          </label>
        </details>
      )}

      {err && <p className="error-msg">{err}</p>}
      <div className="row gap">
        <button className="btn coral" disabled={busy}>
          {busy ? 'Saving…' : live ? 'Open the room' : 'Create assignment'}
        </button>
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
