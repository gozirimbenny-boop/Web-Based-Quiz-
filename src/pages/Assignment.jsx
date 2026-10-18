// /class/:cid/a/:aid — one assignment.
// Students: intro (with a clear note about what the teacher sees) → optional
// study step → quiz. Every answer is saved as it happens, with timing and
// page-leave signals, so the teacher's report is live.
// Teachers: the report — who has / hasn't done it, scores, timing,
// per-question results and integrity signals.
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Squiggle } from '../art/Decor.jsx';
import QuizRunner from '../components/QuizRunner.jsx';
import { ORGANELLE_BY_ID, WHERE_LABEL } from '../data/organelles.js';
import { buildActivity } from '../game/activity.js';
import { summary } from '../game/catalog.js';
import { analyze, createTracker } from '../lib/integrity.js';
import { useSocial } from '../lib/social.jsx';
import { friendlyAuthError } from './Friends.jsx';

export const fmtDue = (ts) => {
  if (!ts) return 'No due date';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
const dueMs = (ts) => (ts ? (ts.toDate ? ts.toDate() : new Date(ts)).getTime() : null);
const fmtDur = (ms) => {
  if (!ms && ms !== 0) return '—';
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

export function statusOf(a, sub) {
  const due = dueMs(a.dueAt);
  if (!sub) return due && Date.now() > due ? 'missing' : 'todo';
  if (sub.status === 'done') return due && sub.finishedAtMs > due ? 'late' : 'done';
  if (sub.status === 'studying') return 'studying';
  return 'started';
}
export const STATUS_LABEL = { todo: 'Not started', missing: 'Missing', studying: 'Studying', started: 'In progress', done: 'Done', late: 'Done late' };

export default function Assignment() {
  const { cid, aid } = useParams();
  const social = useSocial();
  const [a, setA] = useState(undefined);
  useEffect(() => (social.user ? social.watch(['classes', cid, 'assignments', aid], setA) : undefined), [social.user, cid, aid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!social.user) {
    return (
      <div className="card center">
        <Mascot mood="think" size={90} />
        <h2>Sign in to open this assignment</h2>
        <Link to="/friends" className="btn coral">
          Sign in
        </Link>
      </div>
    );
  }
  if (a === undefined) return <p className="muted center">Loading…</p>;
  if (a === null) {
    return (
      <div className="card center">
        <Mascot mood="sad" size={90} />
        <h2>This assignment no longer exists</h2>
        <Link to="/classes" className="btn coral">
          Back to classes
        </Link>
      </div>
    );
  }
  const isTeacher = social.teaching.some((c) => c.id === cid);
  return isTeacher ? <Report cid={cid} a={a} /> : <StudentAssignment cid={cid} a={a} />;
}

// ======================= Student =======================
function StudentAssignment({ cid, a }) {
  const social = useSocial();
  const navigate = useNavigate();
  const sub = social.mySubs[a.id];
  const [stage, setStage] = useState('intro'); // intro | study | quiz
  const [studied, setStudied] = useState([]);
  const studyStart = useRef(0);
  const tracker = useRef(null);
  const last = useRef({ awayMs: 0, leaves: 0 });
  const startedAt = useRef(0);
  const questions = useMemo(() => buildActivity(a.questionIds, a.seed, { shuffle: a.shuffle, uid: social.user.uid }), [a.questionIds, a.seed, a.shuffle, social.user.uid]);
  const status = statusOf(a, sub);
  const closed = a.status === 'closed';
  const finished = sub?.status === 'done';

  useEffect(() => () => tracker.current?.stop(), []);

  const beginStudy = () => {
    studyStart.current = Date.now();
    social.saveSubmission(cid, a.id, { status: 'studying' });
    setStage('study');
  };
  const beginQuiz = () => {
    const studyMs = studyStart.current ? Date.now() - studyStart.current : 0;
    tracker.current?.stop();
    tracker.current = createTracker();
    last.current = { awayMs: 0, leaves: 0 };
    startedAt.current = Date.now();
    social.saveSubmission(cid, a.id, {
      status: 'started',
      startedAtMs: startedAt.current,
      attempts: (sub?.attempts || 0) + 1,
      answers: [],
      leaves: 0,
      awayMs: 0,
      copies: 0,
      pastes: 0,
      ...(a.study?.length ? { studyDone: true, studyMs } : {}),
    });
    setStage('quiz');
  };

  // Save after every answer, with how long the student was away during it.
  const onAnswerLog = (entry, all) => {
    const snap = tracker.current.snapshot();
    entry.away = snap.awayMs - last.current.awayMs;
    entry.leftPage = snap.leaves - last.current.leaves;
    last.current = snap;
    social.saveSubmission(cid, a.id, {
      answers: all.map(({ id, kind, correct, points, max, ms, away = 0, leftPage = 0, given = '' }) => ({ id, kind, correct, points, max, ms, away, leftPage, given: String(given).slice(0, 80) })),
      ...snap,
    });
  };
  const onFinish = ({ score, max, answers }) => {
    const snap = tracker.current.snapshot();
    tracker.current.stop();
    social.saveSubmission(cid, a.id, {
      status: 'done',
      score,
      max,
      correctCount: answers.filter((x) => x.correct).length,
      total: answers.length,
      finishedAtMs: Date.now(),
      durationMs: Date.now() - startedAt.current,
      ...snap,
    });
  };

  if (stage === 'quiz') {
    return (
      <QuizRunner
        mode={{ id: 'assignment', name: a.title, timePer: a.timePer || 0 }}
        questions={questions}
        secure
        onAnswerLog={onAnswerLog}
        onFinish={onFinish}
        extraResults={
          <div className="card duel-result">
            <p>Your result has been sent to your teacher.</p>
            <button className="btn coral small" onClick={() => navigate('/classes')}>
              Back to my classes
            </button>
          </div>
        }
      />
    );
  }

  if (stage === 'study') {
    const cards = a.study.map((id) => ORGANELLE_BY_ID[id]).filter(Boolean);
    const all = cards.every((o) => studied.includes(o.id));
    return (
      <div className="assignment">
        <h1 className="display">
          Study <Squiggle>first.</Squiggle>
        </h1>
        <p className="muted">
          Read each card, then tick it. The quiz unlocks when you’ve studied all {cards.length}.
        </p>
        <div className="study-grid">
          {cards.map((o) => (
            <article key={o.id} className={`info-card study-card ${studied.includes(o.id) ? 'done' : ''}`}>
              <div className="info-head">
                <OrganelleIcon id={o.id} size={56} />
                <div>
                  <h3>{o.name}</h3>
                  <span className={`chip where-${o.where}`}>{WHERE_LABEL[o.where]}</span>
                </div>
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
              <label className="check">
                <input type="checkbox" checked={studied.includes(o.id)} onChange={(e) => setStudied(e.target.checked ? [...studied, o.id] : studied.filter((x) => x !== o.id))} /> I’ve studied this
              </label>
            </article>
          ))}
        </div>
        <button className="btn coral big" disabled={!all} onClick={beginQuiz}>
          {all ? 'Start the quiz' : `Study ${cards.length - studied.length} more`}
        </button>
      </div>
    );
  }

  // Intro
  return (
    <div className="assignment">
      <p className="eyebrow">Assignment</p>
      <h1 className="display">{a.title}</h1>
      {a.instructions && <p className="lead-text">{a.instructions}</p>}
      <div className="facts-row">
        <span className="chip">{a.questionIds.length} questions</span>
        <span className="chip">{a.timePer ? `${a.timePer}s per question` : 'No time limit'}</span>
        <span className="chip">Due: {fmtDue(a.dueAt)}</span>
        {a.study?.length > 0 && <span className="chip">Study step: {a.study.length} cards</span>}
        <span className={`chip status-${status}`}>{STATUS_LABEL[status]}</span>
      </div>

      {finished && !a.retake ? (
        <div className="card center">
          <Mascot mood={sub.score / sub.max >= 0.7 ? 'cool' : 'happy'} size={90} />
          <h2>
            You scored {sub.score}/{sub.max}
          </h2>
          <p className="muted">
            {sub.correctCount}/{sub.total} correct · took {fmtDur(sub.durationMs)}. Your teacher has your result.
          </p>
          <Link to="/classes" className="btn ghost">
            Back to classes
          </Link>
        </div>
      ) : closed ? (
        <div className="card center">
          <Mascot mood="sad" size={80} />
          <h2>This assignment is closed</h2>
          <p className="muted">Your teacher closed it. Ask them if you still need to do it.</p>
        </div>
      ) : (
        <div className="card notice-card">
          <h3>Before you start</h3>
          <p>While you do this activity, your teacher will see:</p>
          <ul>
            <li>your answers and your score,</li>
            <li>how long each answer took,</li>
            <li>if you leave this page or switch apps, and for how long,</li>
            <li>if you copy or paste text.</li>
          </ul>
          <p className="muted small">Stay on this page until you finish. Starting again is recorded too.</p>
          {finished && <p className="muted small">You already finished (score {sub.score}/{sub.max}). Your teacher allows retakes — your latest attempt counts.</p>}
          {a.study?.length > 0 && !(sub?.studyDone) ? (
            <button className="btn coral big" onClick={beginStudy}>
              Start studying
            </button>
          ) : (
            <button className="btn coral big" onClick={beginQuiz}>
              {finished ? 'Retake' : sub?.status === 'started' ? 'Start again' : 'Start'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ======================= Teacher report =======================
const LEVEL_LABEL = { none: 'No concerns', low: 'Minor', medium: 'Check', high: 'Review' };

function Report({ cid, a }) {
  const social = useSocial();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [sort, setSort] = useState('status');
  const [openRow, setOpenRow] = useState(null);
  useEffect(() => social.watch(['classes', cid, 'members'], setMembers), [cid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => social.watch(['classes', cid, 'assignments', a.id, 'submissions'], setSubs), [cid, a.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const subById = Object.fromEntries(subs.map((s) => [s.id, s]));
  // Everyone in the class, plus anyone who submitted and later left.
  const people = [...members.map((m) => ({ uid: m.id, name: m.name, avatar: m.avatar })), ...subs.filter((s) => !members.some((m) => m.id === s.id)).map((s) => ({ uid: s.id, name: s.name, avatar: s.avatar }))];
  const rows = people.map((p) => {
    const sub = subById[p.uid];
    const status = statusOf(a, sub);
    const avgMs = sub?.answers?.length ? sub.answers.reduce((n, x) => n + x.ms, 0) / sub.answers.length : null;
    return { ...p, sub, status, pct: sub?.status === 'done' && sub.max ? sub.score / sub.max : null, avgMs, integrity: analyze(sub) };
  });
  const order = { missing: 0, todo: 1, studying: 2, started: 3, late: 4, done: 5 };
  const levelOrder = { high: 0, medium: 1, low: 2, none: 3 };
  rows.sort((x, y) => {
    if (sort === 'name') return x.name.localeCompare(y.name);
    if (sort === 'score') return (y.pct ?? -1) - (x.pct ?? -1);
    if (sort === 'time') return (x.sub?.durationMs ?? Infinity) - (y.sub?.durationMs ?? Infinity);
    if (sort === 'integrity') return levelOrder[x.integrity.level] - levelOrder[y.integrity.level];
    return order[x.status] - order[y.status];
  });

  const done = rows.filter((r) => r.status === 'done' || r.status === 'late');
  const avgPct = done.length ? Math.round((done.reduce((n, r) => n + (r.pct || 0), 0) / done.length) * 100) : null;

  // Per-question results (only meaningful when everyone had the same questions).
  const perQ = a.questionIds.map((id) => {
    const answers = subs.flatMap((s) => (s.answers || []).filter((x) => x.id === id));
    const right = answers.filter((x) => x.correct).length;
    return { id, n: answers.length, pct: answers.length ? right / answers.length : null, avgMs: answers.length ? answers.reduce((n, x) => n + x.ms, 0) / answers.length : null };
  });

  const csv = () => {
    const head = ['Student', 'Status', 'Score', 'Max', 'Percent', 'Time taken', 'Avg answer time (s)', 'Left page', 'Seconds away', 'Copies', 'Pastes', 'Attempts', 'Signals'];
    const lines = rows.map((r) => [
      r.name,
      STATUS_LABEL[r.status],
      r.sub?.score ?? '',
      r.sub?.max ?? '',
      r.pct != null ? Math.round(r.pct * 100) : '',
      r.sub?.durationMs ? fmtDur(r.sub.durationMs) : '',
      r.avgMs ? (r.avgMs / 1000).toFixed(1) : '',
      r.sub?.leaves ?? '',
      r.sub?.awayMs ? Math.round(r.sub.awayMs / 1000) : '',
      r.sub?.copies ?? '',
      r.sub?.pastes ?? '',
      r.sub?.attempts ?? '',
      r.integrity.notes.join('; '),
    ]);
    const text = [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    link.download = `${a.title.replace(/[^\w-]+/g, '_')}-results.csv`;
    link.click();
  };

  return (
    <div className="report">
      <p className="eyebrow">Assignment report</p>
      <h1 className="display">{a.title}</h1>
      {social.error && <p className="error-msg">{friendlyAuthError(social.error)}</p>}
      <div className="facts-row">
        <span className="chip">{a.questionIds.length} questions</span>
        <span className="chip">Due: {fmtDue(a.dueAt)}</span>
        <span className="chip">{a.shuffle ? 'Shuffled per student' : 'Same questions for all'}</span>
        <span className={`chip ${a.status === 'closed' ? 'status-missing' : 'status-done'}`}>{a.status === 'closed' ? 'Closed' : 'Open'}</span>
      </div>
      <div className="row gap wrap">
        <button className="btn small ghost" onClick={() => social.updateAssignment(cid, a.id, { status: a.status === 'closed' ? 'open' : 'closed' })}>
          {a.status === 'closed' ? 'Reopen' : 'Close assignment'}
        </button>
        <button className="btn small outline" onClick={csv}>
          Download results (CSV)
        </button>
        <button
          className="btn small ghost danger"
          onClick={async () => {
            if (window.confirm(`Delete “${a.title}” and all results?`)) {
              await social.deleteAssignment(cid, a.id);
              navigate('/classes');
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="stats-band compact">
        <div className="stat-big">
          <strong>
            {done.length}/{rows.length}
          </strong>
          <span>Finished</span>
        </div>
        <div className="stat-big">
          <strong>{rows.filter((r) => r.status === 'todo' || r.status === 'missing').length}</strong>
          <span>Not started</span>
        </div>
        <div className="stat-big">
          <strong>{avgPct != null ? `${avgPct}%` : '—'}</strong>
          <span>Average score</span>
        </div>
        <div className="stat-big">
          <strong>{rows.filter((r) => r.integrity.level === 'medium' || r.integrity.level === 'high').length}</strong>
          <span>To review</span>
        </div>
      </div>

      <div className="row gap wrap sort-row">
        <span className="muted small">Sort by</span>
        {[
          ['status', 'Status'],
          ['score', 'Score'],
          ['time', 'Time taken'],
          ['integrity', 'Signals'],
          ['name', 'Name'],
        ].map(([id, label]) => (
          <button key={id} className={`btn small ${sort === id ? 'coral' : 'ghost'}`} onClick={() => setSort(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="class-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Score</th>
              <th>Time taken</th>
              <th>Avg answer</th>
              <th>Signals</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.uid}>
                <tr className={openRow === r.uid ? 'open' : ''}>
                  <td>
                    <span className="student">
                      <OrganelleIcon id={r.avatar || 'nucleus'} size={28} />
                      <strong>{r.name}</strong>
                    </span>
                  </td>
                  <td>
                    <span className={`chip status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td>{r.sub?.status === 'done' ? `${r.sub.score}/${r.sub.max} (${Math.round(r.pct * 100)}%)` : r.sub?.answers?.length ? `${r.sub.answers.length} answered` : '—'}</td>
                  <td>{fmtDur(r.sub?.durationMs)}</td>
                  <td>{r.avgMs ? `${(r.avgMs / 1000).toFixed(1)}s` : '—'}</td>
                  <td>
                    {r.sub ? (
                      <button className={`chip level-${r.integrity.level}`} onClick={() => setOpenRow(openRow === r.uid ? null : r.uid)}>
                        {LEVEL_LABEL[r.integrity.level]} {r.integrity.notes.length > 0 && '▾'}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {r.sub && (
                      <button className="btn small ghost" onClick={() => window.confirm(`Reset ${r.name}'s attempt so they can do it again?`) && social.resetSubmission(cid, a.id, r.uid)}>
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
                {openRow === r.uid && (
                  <tr className="detail-row">
                    <td colSpan={7}>
                      {r.integrity.notes.length ? (
                        <ul className="signal-list">
                          {r.integrity.notes.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="muted small">No warning signs.</p>
                      )}
                      {r.sub?.answers?.length > 0 && (
                        <div className="answer-strip">
                          {r.sub.answers.map((x, i) => (
                            <span key={i} className={`ans-dot ${x.correct ? 'ok' : 'no'} ${x.away > 3000 ? 'away' : ''}`} title={`Q${i + 1}: ${x.correct ? 'correct' : 'wrong'} · ${(x.ms / 1000).toFixed(1)}s${x.away > 0 ? ` · away ${Math.round(x.away / 1000)}s` : ''}`}>
                              {i + 1}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="muted small">Signals are clues, not proof — talk to the student before drawing conclusions.</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="dash-title">Question by question</h3>
      {a.shuffle && <p className="muted small">Order was shuffled per student; results are matched by question.</p>}
      <ol className="perq">
        {perQ.map((q) => {
          const s = summary(q.id);
          return (
            <li key={q.id} className={q.pct != null && q.pct < 0.5 ? 'hard' : ''}>
              <div className="perq-bar">
                <span style={{ width: `${(q.pct ?? 0) * 100}%` }} />
              </div>
              <div className="perq-text">
                <strong>{q.pct != null ? `${Math.round(q.pct * 100)}% correct` : 'No answers yet'}</strong>
                {q.avgMs && <span className="muted small"> · avg {(q.avgMs / 1000).toFixed(1)}s</span>}
                <p>{s.prompt}</p>
                {s.answer && <p className="muted small">Answer: {s.answer}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
