import { useState } from 'react';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { RankBadge } from '../art/Icons.jsx';
import { FlowerFrame } from '../art/Decor.jsx';
import { BADGES, RANKS, useProgress } from '../game/progress.jsx';
import { AvatarPicker } from './Home.jsx';

export default function Profile() {
  const p = useProgress();
  const [name, setName] = useState(p.name);
  const accuracy = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;

  return (
    <div className="profile">
      <div className="card profile-head">
        <FlowerFrame color="#ffe14d" size={88}>
          <OrganelleIcon id={p.avatar} size={56} />
        </FlowerFrame>
        <div className="grow">
          <input
            className="input name-input"
            value={name}
            maxLength={20}
            aria-label="Your name"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && p.update({ name: name.trim() })}
          />
          <p className="muted">
            {p.rank.name} · {p.xp} XP
          </p>
        </div>
        <RankBadge level={p.rank.level} size={64} />
      </div>

      <section className="card">
        <h3>Avatar</h3>
        <AvatarPicker value={p.avatar} onChange={(avatar) => p.update({ avatar })} />
      </section>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{p.games}</span>
          <span className="stat-label">rounds</span>
        </div>
        <div className="stat">
          <span className="stat-num">{accuracy}%</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-num">{p.bestCombo}</span>
          <span className="stat-label">best streak</span>
        </div>
        <div className="stat">
          <span className="stat-num">{p.daily.best}</span>
          <span className="stat-label">best daily streak</span>
        </div>
      </div>

      <section className="card">
        <h3>
          Badges ({p.badges.length}/{BADGES.length})
        </h3>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const got = p.badges.includes(b.id);
            return (
              <div key={b.id} className={`badge ${got ? 'got' : 'locked'}`} title={b.desc}>
                <OrganelleIcon id={b.icon} size={44} />
                <strong>{b.name}</strong>
                <span>{b.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Rank ladder</h3>
        <ol className="ladder">
          {RANKS.map((r, i) => (
            <li key={r.name} className={i <= p.rank.level ? 'reached' : ''}>
              <RankBadge level={i} size={34} />
              <span className="grow">{r.name}</span>
              <span className="muted small">{r.xp} XP</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h3>Settings</h3>
        <label className="toggle">
          <input type="checkbox" checked={!p.muted} onChange={(e) => p.update({ muted: !e.target.checked })} /> Sound effects
        </label>
        <button
          className="btn ghost small danger"
          onClick={() => window.confirm('Reset all progress on this device? This cannot be undone.') && p.reset()}
        >
          Reset my progress
        </button>
      </section>
    </div>
  );
}
