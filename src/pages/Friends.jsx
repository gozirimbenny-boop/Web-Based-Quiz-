// The social hub: sign in, add friends by code, accept requests, send and
// answer duel challenges, and see the leaderboard.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { RankBadge } from '../art/Icons.jsx';
import { FlowerFrame, Squiggle } from '../art/Decor.jsx';
import { useSocial } from '../lib/social.jsx';
import { useProgress, rankFor } from '../game/progress.jsx';

function SetupNeeded() {
  return (
    <div className="card">
      <Mascot mood="think" size={90} />
      <h2>Online play isn’t switched on yet</h2>
      <p className="muted">
        Friends, challenges and the leaderboard need Firebase. Everything else works offline right now. For the site owner:
      </p>
      <ol className="steps">
        <li>Create a free project at console.firebase.google.com and add a Web app.</li>
        <li>Turn on Authentication → Sign-in methods: Google and Anonymous.</li>
        <li>Create a Firestore database and paste in the rules from firestore.rules.</li>
        <li>Add the web config values as GitHub repository variables (see README).</li>
      </ol>
    </div>
  );
}

// Turn Firebase error codes into plain English.
function friendlyAuthError(msg) {
  if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) return 'Sign-in window was closed. Try again!';
  if (msg.includes('popup-blocked')) return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.';
  if (msg.includes('unauthorized-domain')) return 'This website isn’t allowed to sign in yet (site owner: add it under Firebase → Authentication → Settings → Authorized domains).';
  if (msg.includes('admin-restricted-operation') || msg.includes('operation-not-allowed'))
    return 'This sign-in method isn’t switched on yet (site owner: enable it under Firebase → Authentication → Sign-in method).';
  if (msg.includes('network-request-failed')) return 'No internet connection. Check your connection and try again.';
  return msg;
}

function SignIn() {
  const social = useSocial();
  const p = useProgress();
  const [name, setName] = useState(p.name);
  return (
    <div className="card center signin">
      <Mascot mood="wow" size={100} className="bounce" />
      <h2>Play with friends</h2>
      <p className="muted">Sign in to add friends, send challenges and climb the leaderboard.</p>
      <button className="btn primary big" onClick={social.signInGoogle}>
        Sign in with Google
      </button>
      <div className="or">or</div>
      <input className="input" value={name} maxLength={20} placeholder="Pick a username" onChange={(e) => setName(e.target.value)} />
      <button
        className="btn ghost big"
        disabled={!name.trim()}
        onClick={() => {
          p.update({ name: name.trim() });
          social.signInGuest();
        }}
      >
        Play as guest
      </button>
      <p className="muted small">Guest accounts stay on this device only. Use Google to keep your progress across devices.</p>
      {social.error && (
        <p className="error-msg" role="alert">
          {friendlyAuthError(social.error)}
        </p>
      )}
    </div>
  );
}

function Leaderboard() {
  const social = useSocial();
  const [rows, setRows] = useState(null);
  useEffect(() => {
    social.leaderboard().then((r) => setRows(r || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!rows) return <p className="muted">Loading leaderboard…</p>;
  return (
    <ol className="leaderboard">
      {rows.map((r, i) => (
        <li key={r.uid} className={`lb-row ${r.uid === social.user.uid ? 'me' : ''} ${i < 3 ? `top${i + 1}` : ''}`}>
          <span className="lb-pos">{i + 1}</span>
          <OrganelleIcon id={r.avatar || 'nucleus'} size={34} />
          <span className="lb-name">{r.name}</span>
          <RankBadge level={rankFor(r.xp || 0).level} size={26} />
          <span className="lb-xp">{r.xp} XP</span>
        </li>
      ))}
    </ol>
  );
}

export default function Friends() {
  const social = useSocial();
  const p = useProgress();
  const [tab, setTab] = useState('friends');
  const [code, setCode] = useState('');
  const [found, setFound] = useState(null);
  const [note, setNote] = useState('');

  if (!social.enabled) return <SetupNeeded />;
  if (!social.ready) return <p className="muted center">Connecting…</p>;
  if (!social.user) return <SignIn />;

  const lookup = async () => {
    setNote('');
    setFound(null);
    const u = await social.findByCode(code);
    if (u === null && !social.error) setNote('No player with that code. Check the letters and try again.');
    else if (u) setFound(u);
  };

  const add = async () => {
    const ok = await social.sendFriendRequest(found);
    if (ok) {
      setNote(`Friend request sent to ${found.name}!`);
      setFound(null);
      setCode('');
    }
  };

  const openIncoming = social.challenges.incoming.filter((c) => c.status === 'open');
  const finished = [...social.challenges.incoming, ...social.challenges.outgoing].filter((c) => c.status === 'done');
  const waiting = social.challenges.outgoing.filter((c) => c.status === 'open');

  return (
    <div className="friends">
      <h1 className="display">
        Play with <Squiggle>Friends.</Squiggle>
      </h1>
      <div className="card me-card">
        <FlowerFrame color="#ffe14d" size={70}>
          <OrganelleIcon id={p.avatar} size={44} />
        </FlowerFrame>
        <div className="grow">
          <h2>{p.name || 'Player'}</h2>
          <p className="muted small">
            Your friend code: <strong className="code">{social.myCode}</strong>
          </p>
        </div>
        <button className="btn ghost small" onClick={() => navigator.clipboard?.writeText(social.myCode)}>
          Copy code
        </button>
        <button className="btn ghost small" onClick={social.signOut}>
          Sign out
        </button>
      </div>

      {social.error && (
        <p className="error-msg" role="alert">
          {social.error} <button className="link" onClick={social.clearError}>Dismiss</button>
        </p>
      )}

      <div className="segmented wide" role="tablist">
        {[
          ['friends', `Friends (${social.friends.length})`],
          ['challenges', `Challenges${openIncoming.length ? ` (${openIncoming.length})` : ''}`],
          ['leaderboard', 'Leaderboard'],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <>
          {social.requests.length > 0 && (
            <section className="card">
              <h3>Friend requests</h3>
              {social.requests.map((r) => (
                <div key={r.id} className="person-row slide-in">
                  <OrganelleIcon id={r.fromAvatar || 'nucleus'} size={36} />
                  <span className="grow">
                    <strong>{r.fromName}</strong> wants to be friends
                  </span>
                  <button className="btn small ok" onClick={() => social.answerRequest(r, true)}>
                    Accept
                  </button>
                  <button className="btn small ghost" onClick={() => social.answerRequest(r, false)}>
                    Decline
                  </button>
                </div>
              ))}
            </section>
          )}

          <section className="card">
            <h3>Add a friend</h3>
            <div className="row gap">
              <input className="input code-input" value={code} maxLength={6} placeholder="Friend code" onChange={(e) => setCode(e.target.value.toUpperCase())} />
              <button className="btn primary" disabled={code.length < 6} onClick={lookup}>
                Find
              </button>
            </div>
            {found && (
              <div className="person-row pop-in">
                <OrganelleIcon id={found.avatar || 'nucleus'} size={36} />
                <span className="grow">
                  <strong>{found.name}</strong> · {found.rank}
                </span>
                <button className="btn small primary" onClick={add}>
                  Send request
                </button>
              </div>
            )}
            {note && <p className="muted small">{note}</p>}
          </section>

          <section className="card">
            <h3>Your friends</h3>
            {social.friends.length === 0 && <p className="muted">No friends yet — share your code {social.myCode} with classmates!</p>}
            {social.friends.map((f) => (
              <div key={f.uid} className="person-row">
                <OrganelleIcon id={f.avatar || 'nucleus'} size={36} />
                <span className="grow">
                  <strong>{f.name}</strong>
                </span>
                <Link className="btn small primary" to={`/play/duel?to=${f.uid}&toName=${encodeURIComponent(f.name)}`}>
                  Challenge
                </Link>
                <button className="btn small ghost" onClick={() => window.confirm(`Remove ${f.name} from your friends?`) && social.removeFriend(f.uid)}>
                  Remove
                </button>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === 'challenges' && (
        <>
          <section className="card">
            <h3>Waiting for you</h3>
            {openIncoming.length === 0 && <p className="muted">No open challenges. Challenge a friend from the Friends tab!</p>}
            {openIncoming.map((c) => (
              <div key={c.id} className="person-row slide-in">
                <span className="grow">
                  <strong>{c.fromName}</strong> scored {c.fromScore}/{c.fromMax}. Can you beat it?
                </span>
                <Link className="btn small primary pulse" to={`/play/duel?challenge=${c.id}&seed=${encodeURIComponent(c.seed)}`}>
                  Play
                </Link>
              </div>
            ))}
          </section>
          <section className="card">
            <h3>Sent</h3>
            {waiting.length === 0 && <p className="muted">Nothing waiting.</p>}
            {waiting.map((c) => (
              <div key={c.id} className="person-row">
                <span className="grow">
                  Waiting for <strong>{c.toName}</strong> to beat your {c.fromScore}/{c.fromMax}
                </span>
              </div>
            ))}
          </section>
          <section className="card">
            <h3>Results</h3>
            {finished.length === 0 && <p className="muted">Finished duels show up here.</p>}
            {finished.map((c) => {
              const mine = c.from === social.user.uid;
              const myScore = mine ? c.fromScore : c.toScore;
              const theirScore = mine ? c.toScore : c.fromScore;
              const them = mine ? c.toName : c.fromName;
              const res = myScore > theirScore ? 'win' : myScore === theirScore ? 'draw' : 'loss';
              return (
                <div key={c.id} className={`person-row result-${res}`}>
                  <span className="grow">
                    You {myScore} – {theirScore} {them}
                  </span>
                  <span className={`chip result-chip ${res}`}>{res === 'win' ? 'Won' : res === 'draw' ? 'Draw' : 'Lost'}</span>
                  <button className="btn small ghost" onClick={() => social.deleteChallenge(c.id)} aria-label="Clear result">
                    ✕
                  </button>
                </div>
              );
            })}
          </section>
        </>
      )}

      {tab === 'leaderboard' && (
        <section className="card">
          <h3>Top cell scientists</h3>
          <Leaderboard />
        </section>
      )}
    </div>
  );
}
