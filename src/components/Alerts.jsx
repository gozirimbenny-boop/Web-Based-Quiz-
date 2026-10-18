// In-app notifications. While Cell Quest is open (even in a background tab
// or minimised installed app) this watches for new friend requests, new duel
// challenges and finished duels, and shows a toast — plus a system
// notification if the player turned notifications on and isn't looking.
// Also: the "new version" banner, the evening streak reminder and the
// number badge on the app icon.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { useProgress } from '../game/progress.jsx';
import { useSocial } from '../lib/social.jsx';
import { saveStreakState, setAppBadge, systemNotify, useUpdateAvailable } from '../lib/pwa.js';
import { todayKey } from '../game/rng.js';
import { play } from '../game/sound.js';

const SEEN_KEY = 'cellquest.notified.v1';
const loadSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)) || []);
  } catch {
    return new Set();
  }
};
const saveSeen = (set) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-300)));
  } catch {
    /* storage blocked */
  }
};

// quiet: true while a game/activity is on screen. New alerts then wait
// (they aren't marked as seen) so they never cover answer buttons.
export default function Alerts({ quiet = false }) {
  const p = useProgress();
  const social = useSocial();
  const { ready: updateReady, update } = useUpdateAvailable();
  const [toasts, setToasts] = useState([]);
  const seen = useRef(loadSeen());

  const push = (t) => {
    setToasts((list) => [...list.filter((x) => x.id !== t.id), t]);
    play('badge');
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 8000);
    if (p.notify && document.visibilityState !== 'visible') systemNotify(t.title, { body: t.body, url: `./#${t.to}`, tag: t.id });
  };

  // New friend requests, challenges and duel results — each announced once.
  useEffect(() => {
    if (!social.user || quiet) return;
    const fresh = [];
    social.requests.forEach((r) =>
      fresh.push({ id: `req-${r.id}`, icon: r.fromAvatar || 'vesicle', title: 'New friend request', body: `${r.fromName} wants to be friends.`, to: '/friends' }),
    );
    social.challenges.incoming
      .filter((c) => c.status === 'open')
      .forEach((c) =>
        fresh.push({ id: `ch-${c.id}`, icon: 'mitochondrion', title: `${c.fromName} challenged you!`, body: `They scored ${c.fromScore}/${c.fromMax}. Can you beat it?`, to: '/friends' }),
      );
    social.challenges.outgoing
      .filter((c) => c.status === 'done')
      .forEach((c) => {
        const verdict = c.toScore > c.fromScore ? `${c.toName} won` : c.toScore === c.fromScore ? 'It’s a draw' : 'You won';
        fresh.push({ id: `res-${c.id}`, icon: 'golgi', title: 'Duel finished!', body: `${verdict}: you ${c.fromScore} – ${c.toScore} ${c.toName}.`, to: '/friends' });
      });
    social.liveRooms.forEach((r) =>
      fresh.push({ id: `room-${r.id}`, icon: 'mitochondrion', title: `Live game: ${r.title}`, body: `${r.className} is playing now — tap to join!`, to: `/class/${r.cid}/room/${r.id}` }),
    );
    social.assignments
      // Wait until we know whether it's already done (a.id in mySubs).
      .filter((a) => a.status !== 'closed' && a.id in social.mySubs && social.mySubs[a.id]?.status !== 'done')
      .forEach((a) => fresh.push({ id: `as-${a.id}`, icon: 'golgi', title: `New assignment: ${a.title}`, body: `From ${a.className}${a.dueAt ? ' — check the due date' : ''}.`, to: `/class/${a.cid}/a/${a.id}` }));
    const news = fresh.filter((t) => !seen.current.has(t.id));
    if (!news.length) return;
    news.forEach((t) => seen.current.add(t.id));
    saveSeen(seen.current);
    news.slice(-3).forEach(push);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [social.user, social.requests, social.challenges, social.liveRooms, social.assignments, social.mySubs, quiet]);

  // Entering a game hides any toasts already showing.
  useEffect(() => {
    if (quiet) setToasts([]);
  }, [quiet]);

  // Number badge on the installed app icon.
  const todo = social.assignments.filter((a) => a.status !== 'closed' && social.mySubs[a.id]?.status !== 'done').length;
  const pending = social.requests.length + social.challenges.incoming.filter((c) => c.status === 'open').length + todo + social.liveRooms.length;
  useEffect(() => setAppBadge(pending), [pending]);

  // Share streak info with the service worker for background reminders.
  useEffect(() => {
    saveStreakState(p.daily.last, p.daily.streak);
  }, [p.daily.last, p.daily.streak]);

  // Evening reminder while the app is open, once per day.
  useEffect(() => {
    const today = todayKey();
    const key = `streak-${today}`;
    if (quiet || p.daily.last === today || p.daily.streak === 0 || new Date().getHours() < 16 || seen.current.has(key)) return;
    seen.current.add(key);
    saveSeen(seen.current);
    push({ id: key, icon: 'mitochondrion', title: `Keep your ${p.daily.streak}-day streak alive! 🔥`, body: 'Play any round today — the Daily Challenge takes about 3 minutes.', to: '/play/daily' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.daily.last, p.daily.streak, quiet]);

  return (
    <div className="toasts alerts" aria-live="polite">
      {updateReady && (
        <div className="toast update-toast">
          <OrganelleIcon id="ribosome" size={34} />
          <div>
            <strong>A new version of Cell Quest is ready</strong>
            <span>Update when you’re not in the middle of a game.</span>
          </div>
          <button className="btn small coral" onClick={update}>
            Update
          </button>
        </div>
      )}
      {toasts.map((t) => (
        <Link key={t.id} to={t.to} className="toast alert-toast" onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))}>
          <OrganelleIcon id={t.icon} size={36} />
          <div>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
