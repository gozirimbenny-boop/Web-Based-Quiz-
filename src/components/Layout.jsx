import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useProgress } from '../game/progress.jsx';
import { useSocial } from '../lib/social.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { Flame, Speaker, Star } from '../art/Icons.jsx';
import Alerts from './Alerts.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: 'nucleus', end: true },
  { to: '/play', label: 'Games', icon: 'mitochondrion' },
  { to: '/learn', label: 'Learn', icon: 'chloroplast' },
  { to: '/friends', label: 'Friends', icon: 'vesicle' },
  { to: '/profile', label: 'Me', icon: 'ribosome' },
];
// Desktop top menu also shows Classes (on phones it's reached from Friends).
const TOP_NAV = [...NAV.slice(1, 4), { to: '/classes', label: 'Classes' }, NAV[4]];

export default function Layout() {
  const p = useProgress();
  const social = useSocial();
  const { pathname } = useLocation();
  const inGame = /^\/play\/.+|^\/class\/.+\/(room|a)\//.test(pathname);
  const pending = social.requests.length + social.challenges.incoming.filter((c) => c.status === 'open').length;

  return (
    <div className={`app ${inGame ? 'in-game' : ''} ${pathname === '/' ? 'on-home' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Cell Quest home">
            Cell Quest
          </Link>
          <nav className="topnav" aria-label="Main">
            {TOP_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
                {n.to === '/friends' && pending > 0 && <span className="dot">{pending}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-stats">
            <span className="pill" title="Daily streak">
              <Flame size={16} lit={p.daily.streak > 0} /> {p.daily.streak}
            </span>
            <span className="pill" title="Experience points">
              <Star size={14} /> {p.xp}
            </span>
            <button
              className="icon-btn on-dark"
              onClick={() => p.update({ muted: !p.muted })}
              aria-label={p.muted ? 'Turn sound on' : 'Turn sound off'}
              title={p.muted ? 'Sound off' : 'Sound on'}
            >
              <Speaker size={18} on={!p.muted} />
            </button>
            <Link to="/play/daily" className="btn coral small nav-cta">
              Play Daily
            </Link>
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
      <Alerts />

      {!inGame && (
        <footer className="footer">
          <div className="footer-inner">
            <span className="brand">Cell Quest</span>
            <span>Learn cells & organelles through play.</span>
          </div>
        </footer>
      )}

      <nav className="tabbar" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <OrganelleIcon id={n.icon} size={26} />
            <span>{n.label}</span>
            {n.to === '/friends' && pending > 0 && <span className="dot">{pending}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
