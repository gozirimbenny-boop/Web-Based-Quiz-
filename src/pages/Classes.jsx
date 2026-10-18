// Classes: students join a teacher's class with a 6-letter code; teachers
// create classes and see a live dashboard of their students' progress and
// the questions the class gets wrong most often.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { RankBadge } from '../art/Icons.jsx';
import { Squiggle } from '../art/Decor.jsx';
import { useSocial } from '../lib/social.jsx';
import { rankFor } from '../game/progress.jsx';
import { exists, summary } from '../game/catalog.js';

const ago = (ts) => {
  if (!ts?.seconds) return '—';
  const mins = Math.round((Date.now() / 1000 - ts.seconds) / 60);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} days ago`;
};

function downloadCsv(cls, members) {
  const rows = [['Name', 'XP', 'Rank', 'Rounds', 'Accuracy %', 'Best streak', 'Day streak', 'Mistakes to review']];
  members.forEach((m) =>
    rows.push([m.name, m.xp, rankFor(m.xp || 0).name, m.games || 0, m.answered ? Math.round((m.correct / m.answered) * 100) : 0, m.bestCombo || 0, m.streak || 0, (m.mistakes || []).length]),
  );
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${cls.name.replace(/[^\w-]+/g, '_')}-progress.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Dashboard({ cls }) {
  const social = useSocial();
  const [members, setMembers] = useState(null);
  useEffect(() => social.watchMembers(cls.id, setMembers), [cls.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => [...(members || [])].sort((a, b) => (b.xp || 0) - (a.xp || 0)), [members]);
  const topMistakes = useMemo(() => {
    const counts = {};
    (members || []).forEach((m) => (m.mistakes || []).filter(exists).forEach((id) => (counts[id] = (counts[id] || 0) + 1)));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [members]);

  if (!members) return <p className="muted">Loading students…</p>;
  if (!members.length)
    return (
      <p className="muted">
        No students yet. Ask them to open <strong>Friends → Classes</strong> and enter the code <strong className="code">{cls.code}</strong>.
      </p>
    );

  return (
    <div className="dashboard">
      <div className="table-wrap">
        <table className="class-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>XP</th>
              <th>Rounds</th>
              <th>Accuracy</th>
              <th>Best streak</th>
              <th>Day streak</th>
              <th>Last active</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.uid}>
                <td>
                  <span className="student">
                    <OrganelleIcon id={m.avatar || 'nucleus'} size={28} />
                    <span>
                      <strong>{m.name}</strong>
                      <small>{rankFor(m.xp || 0).name}</small>
                    </span>
                  </span>
                </td>
                <td>{m.xp || 0}</td>
                <td>{m.games || 0}</td>
                <td>{m.answered ? `${Math.round((m.correct / m.answered) * 100)}%` : '—'}</td>
                <td>{m.bestCombo || 0}</td>
                <td>{m.streak || 0}</td>
                <td>{ago(m.updatedAt)}</td>
                <td>
                  <button className="btn small ghost" onClick={() => window.confirm(`Remove ${m.name} from ${cls.name}?`) && social.removeMember(cls.id, m.uid)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn small outline" onClick={() => downloadCsv(cls, sorted)}>
        Download as spreadsheet (CSV)
      </button>

      <h3 className="dash-title">Most-missed questions</h3>
      {topMistakes.length === 0 ? (
        <p className="muted">No shared mistakes yet — great work, class!</p>
      ) : (
        <ul className="review">
          {topMistakes.map(([id, n]) => {
            const s = summary(id);
            return (
              <li key={id} className="review-item">
                <span className="chip">
                  {n} student{n === 1 ? '' : 's'}
                </span>
                <p className="review-q">{s.prompt}</p>
                <p className="review-answer">
                  Answer: <strong>{s.answer}</strong>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Classes() {
  const social = useSocial();
  const [code, setCode] = useState('');
  const [newName, setNewName] = useState('');
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(null);

  if (!social.enabled || !social.user) {
    return (
      <div className="card center">
        <Mascot mood="think" size={90} />
        <h2>Sign in to use classes</h2>
        <p className="muted">Students join a class with a code; teachers see everyone’s progress.</p>
        <Link to="/friends" className="btn coral">
          Sign in
        </Link>
      </div>
    );
  }

  const join = async () => {
    setNote('');
    const cls = await social.joinClass(code);
    if (cls) {
      setNote(`You joined ${cls.name}!`);
      setCode('');
    }
  };
  const create = async () => {
    const c = await social.createClass(newName);
    if (c) {
      setNote(`Class created! Share the code ${c} with your students.`);
      setNewName('');
    }
  };

  return (
    <div className="classes-page">
      <h1 className="display">
        My <Squiggle>Classes.</Squiggle>
      </h1>
      {social.error && (
        <p className="error-msg" role="alert">
          {social.error} <button className="link" onClick={social.clearError}>Dismiss</button>
        </p>
      )}
      {note && <p className="note-msg">{note}</p>}

      <section className="card">
        <h3>Join a class</h3>
        <p className="muted small">Your teacher will see your name, XP, accuracy, streaks and the questions you’ve missed.</p>
        <div className="row gap">
          <input className="input code-input" value={code} maxLength={6} placeholder="Class code" onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="btn coral" disabled={code.length < 6} onClick={join}>
            Join
          </button>
        </div>
        {social.classes.map((c) => (
          <div key={c.id} className="person-row">
            <OrganelleIcon id="nucleus" size={34} />
            <span className="grow">
              <strong>{c.name}</strong> · teacher {c.teacherName}
            </span>
            <button className="btn small ghost" onClick={() => window.confirm(`Leave ${c.name}?`) && social.leaveClass(c.id)}>
              Leave
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Teach a class</h3>
        <p className="muted small">Create a class, share its code, and follow your students’ progress live.</p>
        <div className="row gap">
          <input className="input" value={newName} maxLength={40} placeholder="Class name, e.g. PN Group A" onChange={(e) => setNewName(e.target.value)} />
          <button className="btn coral" disabled={!newName.trim()} onClick={create}>
            Create
          </button>
        </div>
      </section>

      {social.teaching.map((c) => (
        <section key={c.id} className="card class-card">
          <div className="class-head">
            <div className="grow">
              <h3>{c.name}</h3>
              <p className="muted small">
                Join code: <strong className="code">{c.code}</strong>
              </p>
            </div>
            <button className="btn small ghost" onClick={() => navigator.clipboard?.writeText(c.code)}>
              Copy code
            </button>
            <button className="btn small coral" onClick={() => setOpen(open === c.id ? null : c.id)}>
              {open === c.id ? 'Hide dashboard' : 'Open dashboard'}
            </button>
            <button className="btn small ghost danger" onClick={() => window.confirm(`Delete ${c.name}? Students will be removed from it.`) && social.deleteClass(c.id)}>
              Delete
            </button>
          </div>
          {open === c.id && <Dashboard cls={c} />}
        </section>
      ))}

      {social.teaching.length > 0 && (
        <p className="muted small center">
          <RankBadge level={2} size={20} /> Tip: students who haven’t played lately show an old “last active” time.
        </p>
      )}
    </div>
  );
}
