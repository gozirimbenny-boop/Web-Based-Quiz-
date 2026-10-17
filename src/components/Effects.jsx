// All the "juice": confetti, the 3-2-1 countdown, per-answer bursts,
// streak-lost, level-up and badge pop-ups.
import { useEffect, useRef, useState } from 'react';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Flame, RankBadge, Star } from '../art/Icons.jsx';
import { BADGES } from '../game/progress.jsx';
import { play } from '../game/sound.js';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------- Confetti (canvas) ----------
export function Confetti({ fire, pieces = 160 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire || reducedMotion()) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    resize();
    const colors = ['#f59e4b', '#a78bfa', '#3fa34d', '#ef6b57', '#60a5fa', '#facc15', '#f472b6'];
    const parts = Array.from({ length: pieces }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 6,
      r: Math.random() * 6 + 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.35 ? 'circle' : 'rect',
    }));
    let frame;
    let t = 0;
    const tick = () => {
      t++;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.38;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - t / 220);
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      if (t < 220) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [fire, pieces]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

// ---------- 3-2-1-GO countdown ----------
export function Countdown({ title, onDone }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n === 0) {
      play('go');
      const t = setTimeout(onDone, 650);
      return () => clearTimeout(t);
    }
    play('tick');
    const t = setTimeout(() => setN(n - 1), 700);
    return () => clearTimeout(t);
  }, [n, onDone]);
  return (
    <div className="overlay countdown" role="status" aria-live="assertive">
      <p className="countdown-title">{title}</p>
      <div key={n} className={`countdown-num ${n === 0 ? 'go' : ''}`}>
        {n === 0 ? 'GO!' : n}
      </div>
      <div className="countdown-ring" />
      <button className="btn ghost small skip" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}

// ---------- Per-answer burst ----------
const PRAISE = ['Great job!', 'Brilliant!', 'Cell-ebrate!', 'Mito-mighty!', 'Nailed it!', 'Spot on!', 'Nucle-yes!', 'Super cell!'];
const OOPS = ['Not quite!', 'Almost!', 'Oops!', 'Keep going!'];

export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
export const oops = () => OOPS[Math.floor(Math.random() * OOPS.length)];

// burst = { type: 'correct'|'wrong'|'combo'|'streakLost'|'timeUp', text, n, key }
export function Burst({ burst }) {
  if (!burst) return null;
  const { type, text, n, key } = burst;
  return (
    <div key={key} className={`burst burst-${type}`} role="status" aria-live="polite">
      {type === 'combo' && (
        <div className="burst-combo">
          <Flame size={56} />
          <span className="combo-n">{n}</span>
        </div>
      )}
      {type === 'streakLost' && (
        <div className="burst-streaklost">
          <div className="flame-break">
            <Flame size={56} lit={false} />
          </div>
          <span className="combo-n lost">×{n}</span>
        </div>
      )}
      {type === 'correct' && (
        <div className="burst-stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={26} className={`star s${i}`} />
          ))}
        </div>
      )}
      <div className="burst-text">{text}</div>
    </div>
  );
}

// ---------- "You lost your streak" full-screen ----------
export function StreakLostOverlay({ days, onClose, daily = true }) {
  useEffect(() => play('streakLost'), []);
  return (
    <div className="overlay streak-lost-overlay" role="dialog" aria-modal="true" aria-label="Streak lost">
      <div className="streak-lost-card">
        <div className="flame-shatter">
          <Flame size={110} lit={false} />
          <span className="shard a" />
          <span className="shard b" />
          <span className="shard c" />
        </div>
        <Mascot mood="sad" size={90} className="wobble" />
        <h2>You lost your streak!</h2>
        <p>
          Your {days}-{daily ? 'day' : 'answer'} streak has ended. {daily ? 'Play today to start a new one — you’ve got this!' : 'Shake it off!'}
        </p>
        <button className="btn primary big pulse" onClick={onClose}>
          Start a new streak
        </button>
      </div>
    </div>
  );
}

// ---------- Level up ----------
export function LevelUpOverlay({ rank, onClose }) {
  useEffect(() => play('levelUp'), []);
  return (
    <div className="overlay levelup-overlay" role="dialog" aria-modal="true" aria-label="Rank up" onClick={onClose}>
      <div className="levelup-rays" />
      <div className="levelup-card">
        <p className="eyebrow">Rank up!</p>
        <div className="levelup-badge">
          <RankBadge level={rank.level} size={120} />
        </div>
        <h2>{rank.name}</h2>
        <p>You’re growing like a healthy cell. Keep it up!</p>
        <button className="btn primary big" onClick={onClose}>
          Awesome!
        </button>
      </div>
      <Confetti fire />
    </div>
  );
}

// ---------- Badge unlocked toasts ----------
export function BadgeToasts({ ids }) {
  const [shown, setShown] = useState([]);
  useEffect(() => {
    if (!ids?.length) return undefined;
    const timers = ids.map((id, i) =>
      setTimeout(() => {
        setShown((s) => [...s, id]);
        play('badge');
      }, 900 + i * 900),
    );
    return () => timers.forEach(clearTimeout);
  }, [ids]);
  return (
    <div className="toasts" aria-live="polite">
      {shown.map((id) => {
        const b = BADGES.find((x) => x.id === id);
        return (
          <div key={id} className="toast badge-toast">
            <OrganelleIcon id={b.icon} size={36} />
            <div>
              <strong>Badge unlocked: {b.name}</strong>
              <span>{b.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Animated number that counts up.
export function CountUp({ to, duration = 900 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      setV(to);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{v}</>;
}
