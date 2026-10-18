// /class/:cid/room/:rid — a live game, Kahoot-style.
// Teacher (host) screen: lobby → question (countdown, answers coming in) →
// reveal (right answer, answer breakdown, top 5) → … → podium + results.
// Student screen: join → answer on your device → see if you were right and
// your rank. Faster correct answers score more (500–1000 points).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import CellDiagram from '../art/CellDiagram.jsx';
import { Trophy } from '../art/Icons.jsx';
import { Burst, Confetti } from '../components/Effects.jsx';
import { buildActivity } from '../game/activity.js';
import { analyze, createTracker } from '../lib/integrity.js';
import { useSocial } from '../lib/social.jsx';
import { play } from '../game/sound.js';
import { friendlyAuthError } from './Friends.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];
const TILE_COLORS = ['#f2502f', '#1f7ae0', '#e8b100', '#16924a'];

// Seconds left on the current question, counted from when this screen saw it.
function useCountdown(room) {
  const seenAt = useRef({});
  const key = `${room?.index}-${room?.state}`;
  if (room?.state === 'question' && !seenAt.current[key]) seenAt.current[key] = Date.now();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (room?.state !== 'question') return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [room?.state, room?.index]);
  const start = seenAt.current[key];
  const left = room?.state === 'question' && start ? Math.max(0, room.timePer - (now - start) / 1000) : 0;
  return { left, start };
}

const ranked = (players) => [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

export default function Room() {
  const { cid, rid } = useParams();
  const social = useSocial();
  const [room, setRoom] = useState(undefined);
  const [players, setPlayers] = useState([]);
  useEffect(() => (social.user ? social.watch(['classes', cid, 'rooms', rid], setRoom) : undefined), [social.user, cid, rid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => (social.user ? social.watch(['classes', cid, 'rooms', rid, 'players'], setPlayers) : undefined), [social.user, cid, rid]); // eslint-disable-line react-hooks/exhaustive-deps
  const questions = useMemo(() => (room ? buildActivity(room.questionIds, room.seed) : []), [room?.seed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!social.user) {
    return (
      <div className="card center">
        <h2>Sign in to join the game</h2>
        <Link to="/friends" className="btn coral">
          Sign in
        </Link>
      </div>
    );
  }
  if (room === undefined) return <p className="muted center">Connecting to the room…</p>;
  if (room === null) {
    return (
      <div className="card center">
        <Mascot mood="sleep" size={90} />
        <h2>This game has finished</h2>
        <Link to="/classes" className="btn coral">
          Back to classes
        </Link>
      </div>
    );
  }
  const props = { cid, rid, room, players, questions };
  return room.host === social.user.uid ? <Host {...props} /> : <Player {...props} />;
}

// ======================= Teacher screen =======================
function Host({ cid, rid, room, players, questions }) {
  const social = useSocial();
  const navigate = useNavigate();
  const q = questions[room.index];
  const { left } = useCountdown(room);
  const answered = players.filter((p) => p.answers?.[room.index]);
  const last = room.index >= questions.length - 1;

  // Reveal automatically when time is up or everyone has answered.
  useEffect(() => {
    if (room.state !== 'question') return;
    if ((left <= 0 && room.timePer) || (players.length > 0 && answered.length >= players.length)) {
      social.setRoomState(cid, rid, { state: 'reveal' });
    }
  }, [left, answered.length, players.length, room.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (room.state === 'reveal') play('correct');
    if (room.state === 'ended') play('win');
  }, [room.state, room.index]);

  const next = () => social.setRoomState(cid, rid, last ? { state: 'ended' } : { state: 'question', index: room.index + 1 });

  return (
    <div className="room host">
      {social.error && <p className="error-msg">{friendlyAuthError(social.error)}</p>}
      <div className="room-top">
        <div>
          <p className="eyebrow">Live game · {room.title}</p>
          {room.state !== 'lobby' && room.state !== 'ended' && (
            <strong>
              Question {room.index + 1} of {questions.length}
            </strong>
          )}
        </div>
        <span className="pill-dark">{players.length} players</span>
        <button
          className="btn small ghost danger"
          onClick={async () => {
            if (window.confirm('End and delete this game?')) {
              await social.deleteRoom(cid, rid);
              navigate('/classes');
            }
          }}
        >
          Delete game
        </button>
      </div>

      {room.state === 'lobby' && (
        <div className="lobby">
          <h1 className="display center">Join the game!</h1>
          <p className="center lead-text">
            Students: open <strong>Cell Quest → Classes</strong> and tap <strong>Join live game</strong>.
          </p>
          <div className="lobby-players">
            {players.length === 0 && <p className="muted">Waiting for players…</p>}
            {players.map((p) => (
              <span key={p.id} className="lobby-player pop-in">
                <OrganelleIcon id={p.avatar || 'nucleus'} size={30} /> {p.name}
              </span>
            ))}
          </div>
          <button className="btn coral big" disabled={!players.length} onClick={() => social.setRoomState(cid, rid, { state: 'question', index: 0 })}>
            Start the game
          </button>
        </div>
      )}

      {(room.state === 'question' || room.state === 'reveal') && q && (
        <div className="stage">
          <div className="stage-q">
            {room.state === 'question' && (
              <div className={`big-timer ${left <= 5 ? 'low' : ''}`}>
                <span>{Math.ceil(left)}</span>
              </div>
            )}
            <h1>{q.prompt}</h1>
            {q.art && (
              <div className="q-art">
                <CellDiagram type={q.art.cell} highlight={q.art.highlight} dim />
              </div>
            )}
          </div>
          <div className="tiles-grid">
            {q.choices.map((c, i) => {
              const n = players.filter((p) => p.answers?.[room.index]?.choice === i).length;
              const isRight = i === q.correct;
              return (
                <div
                  key={c}
                  className={`answer-tile ${room.state === 'reveal' ? (isRight ? 'right' : 'faded') : ''}`}
                  style={{ '--tile': TILE_COLORS[i] }}
                >
                  <span className="tile-letter">{LETTERS[i]}</span>
                  <span className="tile-text">{c}</span>
                  {room.state === 'reveal' && <span className="tile-count">{n}</span>}
                </div>
              );
            })}
          </div>
          {room.state === 'question' ? (
            <div className="row gap center">
              <span className="answered-count">
                {answered.length}/{players.length} answered
              </span>
              <button className="btn ghost small" onClick={() => social.setRoomState(cid, rid, { state: 'reveal' })}>
                Reveal now
              </button>
            </div>
          ) : (
            <div className="reveal">
              {q.explain && <p className="reveal-explain">{q.explain}</p>}
              <h3>Top players</h3>
              <ol className="mini-board">
                {ranked(players)
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id} className="slide-in">
                      <OrganelleIcon id={p.avatar || 'nucleus'} size={26} /> <span className="grow">{p.name}</span> <strong>{p.score || 0}</strong>
                    </li>
                  ))}
              </ol>
              <button className="btn coral big" onClick={next}>
                {last ? 'Show the winners' : 'Next question →'}
              </button>
            </div>
          )}
        </div>
      )}

      {room.state === 'ended' && <Podium players={players} questions={questions} host />}
    </div>
  );
}

function Podium({ players, questions, host }) {
  const top = ranked(players);
  const places = [top[1], top[0], top[2]];
  return (
    <div className="podium-wrap">
      <Confetti fire />
      <Trophy size={90} className="trophy-bounce" />
      <h1 className="display center">Winners!</h1>
      <div className="podium">
        {places.map((p, i) =>
          p ? (
            <div key={p.id} className={`podium-col place-${[2, 1, 3][i]}`}>
              <OrganelleIcon id={p.avatar || 'nucleus'} size={48} />
              <strong>{p.name}</strong>
              <span>{p.score || 0}</span>
              <div className="podium-block">{[2, 1, 3][i]}</div>
            </div>
          ) : (
            <div key={i} className="podium-col empty" />
          ),
        )}
      </div>
      {host && <HostResults players={top} questions={questions} />}
    </div>
  );
}

function HostResults({ players, questions }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="table-wrap results-table">
      <table className="class-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Points</th>
            <th>Correct</th>
            <th>Avg answer</th>
            <th>Signals</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const answers = Object.values(p.answers || {});
            const sig = analyze({ ...p, answers: answers.map((x) => ({ ...x, kind: 'choice' })) });
            const avg = answers.length ? answers.reduce((n, x) => n + x.ms, 0) / answers.length / 1000 : null;
            return (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.score || 0}</td>
                <td>
                  {answers.filter((x) => x.correct).length}/{questions.length}
                </td>
                <td>{avg ? `${avg.toFixed(1)}s` : '—'}</td>
                <td>
                  <button className={`chip level-${sig.level}`} onClick={() => setOpen(open === p.id ? null : p.id)}>
                    {sig.notes.length ? `${sig.notes.length} signal${sig.notes.length === 1 ? '' : 's'} ▾` : 'None'}
                  </button>
                  {open === p.id && (
                    <ul className="signal-list">
                      {sig.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ======================= Student screen =======================
function Player({ cid, rid, room, players, questions }) {
  const social = useSocial();
  const me = players.find((p) => p.id === social.user.uid);
  const q = questions[room.index];
  const mine = me?.answers?.[room.index];
  const { left, start } = useCountdown(room);
  const tracker = useRef(null);
  const last = useRef({ awayMs: 0, leaves: 0 });
  const [burst, setBurst] = useState(null);

  useEffect(() => {
    social.joinRoom(cid, rid);
    tracker.current = createTracker();
    return () => tracker.current?.stop();
  }, [cid, rid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Feedback when the answer is revealed.
  useEffect(() => {
    if (room.state !== 'reveal') return;
    if (mine?.correct) {
      play('correct');
      setBurst({ type: 'correct', text: `+${mine.points}`, key: room.index });
    } else {
      play('wrong');
      setBurst({ type: 'wrong', text: mine ? 'Not quite!' : 'Too slow!', key: room.index });
    }
    const t = setTimeout(() => setBurst(null), 1600);
    return () => clearTimeout(t);
  }, [room.state, room.index]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (i) => {
    if (mine || room.state !== 'question' || left <= 0) return;
    play('tap');
    const ms = Date.now() - start;
    const correct = i === q.correct;
    const points = correct ? Math.round(1000 - 500 * Math.min(1, ms / (room.timePer * 1000))) : 0;
    const snap = tracker.current.snapshot();
    const away = snap.awayMs - last.current.awayMs;
    last.current = snap;
    social.answerRoom(cid, rid, room.index, { choice: i, correct, ms, points, away }, snap);
  };

  const rank = ranked(players).findIndex((p) => p.id === social.user.uid) + 1;

  if (!me) return <p className="muted center">Joining…</p>;

  return (
    <div className="room player secure">
      <div className="room-top">
        <span className="player-me">
          <OrganelleIcon id={me.avatar || 'nucleus'} size={28} /> {me.name}
        </span>
        <span className="pill-dark">{me.score || 0} pts</span>
      </div>

      {room.state === 'lobby' && (
        <div className="card center">
          <Mascot mood="happy" size={110} className="bounce" />
          <h2>You’re in!</h2>
          <p className="muted">Waiting for your teacher to start “{room.title}”. {players.length} player{players.length === 1 ? '' : 's'} joined.</p>
          <p className="muted small">Your teacher will see your answers, how fast you answer, and if you leave this page.</p>
        </div>
      )}

      {room.state === 'question' && q && (
        <div className="player-q">
          <div className={`big-timer small ${left <= 5 ? 'low' : ''}`}>
            <span>{Math.ceil(left)}</span>
          </div>
          <h2 className="q-prompt center">{q.prompt}</h2>
          {q.art && (
            <div className="q-art">
              <CellDiagram type={q.art.cell} highlight={q.art.highlight} dim />
            </div>
          )}
          {mine ? (
            <div className="card center locked-in">
              <Mascot mood="think" size={80} />
              <h3>Answer locked in!</h3>
              <p className="muted">Waiting for everyone else…</p>
            </div>
          ) : left <= 0 ? (
            <div className="card center">
              <h3>Time’s up!</h3>
            </div>
          ) : (
            <div className="tiles-grid player-tiles">
              {q.choices.map((c, i) => (
                <button key={c} className="answer-tile" style={{ '--tile': TILE_COLORS[i] }} onClick={() => answer(i)}>
                  <span className="tile-letter">{LETTERS[i]}</span>
                  <span className="tile-text">{c}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {room.state === 'reveal' && q && (
        <div className="card center">
          <Mascot mood={mine?.correct ? 'wow' : 'sad'} size={90} />
          <h2>{mine?.correct ? 'Correct!' : 'The answer was:'}</h2>
          {!mine?.correct && <p className="reveal-answer">{q.choices[q.correct]}</p>}
          <p className="muted">
            You’re <strong>#{rank}</strong> of {players.length} with {me.score || 0} points.
          </p>
        </div>
      )}

      {room.state === 'ended' && (
        <>
          <Podium players={players} questions={questions} />
          <p className="center lead-text">
            You finished <strong>#{rank}</strong> with {me.score || 0} points!
          </p>
          <div className="row center">
            <Link to="/classes" className="btn coral">
              Back to classes
            </Link>
          </div>
        </>
      )}
      <Burst burst={burst} />
    </div>
  );
}
