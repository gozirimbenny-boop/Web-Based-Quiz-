import { Link } from 'react-router-dom';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Squiggle } from '../art/Decor.jsx';
import { MODES } from '../game/modes.js';
import { useProgress } from '../game/progress.jsx';

const TONES = ['green', 'coral', 'mint', 'yellow'];

export default function Modes() {
  const p = useProgress();
  const visible = MODES.filter((m) => !m.hidden);
  const cards = [...visible];
  if (p.mistakes.length > 0) {
    cards.push({ id: 'mistakes', name: 'Fix My Mistakes', blurb: `Replay ${Math.min(12, p.mistakes.length)} questions you got wrong. Get them right to clear them.`, icon: 'cytoskeleton' });
  }
  return (
    <div className="modes-page">
      <h1 className="display center">
        Choose Your <Squiggle>Game.</Squiggle>
      </h1>
      <p className="muted center">Every mode earns XP. Timed modes are marked with a clock.</p>
      <div className="mode-grid">
        {cards.map((m, i) => (
          <Link key={m.id} to={`/play/${m.id}`} className={`mode-card tone-${TONES[i % TONES.length]}`} style={{ '--i': i }}>
            <div className="mode-art">
              <svg className="mode-blob" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 70c30-20 50 16 90 0s50-50 110-30V120H0z" />
              </svg>
              <OrganelleIcon id={m.icon} size={78} />
              {p.modesPlayed.includes(m.id) && <span className="played">Played ✓</span>}
            </div>
            <div className="mode-body">
              <div className="mode-tags">
                {m.totalTime && <span className="mini-tag">⏱ 10 min</span>}
                {m.timePer && <span className="mini-tag">⏱ {m.timePer}s each</span>}
                {m.voice && <span className="mini-tag">🎤 Voice</span>}
                {m.featured && <span className="mini-tag hot">Popular</span>}
              </div>
              <h3>{m.name}</h3>
              <p>{m.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
