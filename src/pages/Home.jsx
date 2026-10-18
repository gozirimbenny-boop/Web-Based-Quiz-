// Home page, laid out like the "Little Minds" template: green hero with
// clouds, stats row, "learning through play", game cards, progress,
// "a day in the cell" gallery and the friends section.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Mascot from '../art/Mascot.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import CellDiagram from '../art/CellDiagram.jsx';
import { Flame, RankBadge } from '../art/Icons.jsx';
import { BlobBuddy, BlobFrame, BunnyBuddy, CloudEdge, CurlyArrow, FlowerFrame, LoopArrow, Sparks, Squiggle } from '../art/Decor.jsx';
import { StreakLostOverlay } from '../components/Effects.jsx';
import { InstallCard } from '../components/AppSettings.jsx';
import { useSocial } from '../lib/social.jsx';
import { BADGES, useProgress } from '../game/progress.jsx';
import { MODES, MODE_BY_ID } from '../game/modes.js';
import { todayKey } from '../game/rng.js';
import { ORGANELLES } from '../data/organelles.js';
import { MCQ, TRUE_FALSE, RIDDLES, SCRAMBLES, FILL, ODD_ONE_OUT, SORT, TWO_PART } from '../data/questions.js';

const QUESTION_COUNT = [MCQ, TRUE_FALSE, RIDDLES, SCRAMBLES, FILL, ODD_ONE_OUT, SORT, TWO_PART].reduce((n, l) => n + l.length, 0);
const GALLERY_TONES = ['mint', 'yellow', 'coral', 'green', 'cream', 'mint', 'yellow', 'coral'];

export function AvatarPicker({ value, onChange }) {
  return (
    <div className="avatar-grid" role="radiogroup" aria-label="Choose an avatar">
      {ORGANELLES.map((o) => (
        <button key={o.id} role="radio" aria-checked={value === o.id} className={`avatar-opt ${value === o.id ? 'on' : ''}`} onClick={() => onChange(o.id)} title={o.name}>
          <OrganelleIcon id={o.id} size={40} />
        </button>
      ))}
    </div>
  );
}

function Welcome({ onDone }) {
  const p = useProgress();
  const [name, setName] = useState(p.name);
  const [avatar, setAvatar] = useState(p.avatar);
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="modal welcome">
        <Mascot mood="wow" size={100} className="bounce" />
        <h2>
          Welcome to <Squiggle>Cell Quest!</Squiggle>
        </h2>
        <p className="muted">I’m Cello, your lab buddy. What should I call you?</p>
        <input className="input" value={name} maxLength={20} placeholder="Your name or nickname" onChange={(e) => setName(e.target.value)} autoFocus />
        <p className="label">Pick your organelle avatar</p>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <button
          className="btn coral big"
          disabled={!name.trim()}
          onClick={() => {
            p.update({ name: name.trim(), avatar, seenIntro: true });
            onDone();
          }}
        >
          Let’s go!
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const p = useProgress();
  const social = useSocial();
  const todo = social.assignments.filter((a) => a.status !== 'closed' && social.mySubs[a.id]?.status !== 'done');
  const [intro, setIntro] = useState(!p.seenIntro);
  const dailyDone = p.dailyDone === todayKey();
  const { rank } = p;
  const programs = [
    { mode: MODE_BY_ID.daily, tone: 'green', art: <CellDiagram type="animal" />, label: 'Daily' },
    { mode: MODE_BY_ID.quick, tone: 'coral', art: <Mascot mood="wow" size={150} />, label: '10 min', big: true },
    { mode: MODE_BY_ID.build, tone: 'mint', art: <CellDiagram type="plant" />, label: 'Puzzle' },
  ];

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <div className="rating-pill">
            <span className="avatar-stack">
              {['mitochondrion', 'chloroplast', 'nucleus', 'golgi'].map((id) => (
                <span key={id} className="avatar-dot">
                  <OrganelleIcon id={id} size={26} />
                </span>
              ))}
            </span>
            <span>
              <strong>{QUESTION_COUNT}+</strong> questions
            </span>
          </div>
          <h1>
            Where Curious Minds <Squiggle tone="yellow">Explore</Squiggle> the Cell and Grow Brighter.
          </h1>
          <p className="hero-lead">
            {p.name ? `Welcome back, ${p.name}! ` : ''}Riddles, scrambles, diagrams, timed quizzes and friendly duels — the most fun way to learn cells and organelles.
          </p>
          <div className="hero-ctas">
            <Link to="/play" className="btn coral big">
              Start Playing
            </Link>
            <Link to="/learn" className="btn outline-light big">
              Explore a Cell
            </Link>
          </div>

          <div className="hero-stage">
            <LoopArrow className="hero-loop" />
            <Sparks className="hero-sparks" />
            <BlobFrame tone="coral" tilt={-8} className="stage-side left">
              <CellDiagram type="plant" />
            </BlobFrame>
            <BlobFrame tone="yellow" className="stage-main">
              <Mascot mood={dailyDone ? 'cool' : 'happy'} size={210} className="bounce" />
            </BlobFrame>
            <BlobFrame tone="mint" tilt={8} className="stage-side right">
              <OrganelleIcon id="mitochondrion" size={140} />
            </BlobFrame>
          </div>
        </div>
        <CloudEdge />
      </section>

      {/* ---------- Stats ---------- */}
      <section className="stats-band">
        <div className="stat-big">
          <strong>{MODES.filter((m) => !m.hidden).length}</strong>
          <span>Game modes</span>
        </div>
        <div className="stat-big">
          <strong>{ORGANELLES.length}</strong>
          <span>Cell parts to learn</span>
        </div>
        <div className="stat-big">
          <strong>{p.xp}</strong>
          <span>Your XP</span>
        </div>
        <div className="stat-big">
          <strong>{p.daily.streak}</strong>
          <span>Day streak</span>
        </div>
      </section>

      <div className="install-wrap">
        {social.liveRooms.map((r) => (
          <Link key={r.id} to={`/class/${r.cid}/room/${r.id}`} className="card live-banner">
            <span className="live-dot" aria-hidden="true" />
            <span className="grow">
              <strong>Live now: {r.title}</strong>
              <span className="small"> · {r.className}</span>
            </span>
            <span className="btn coral small">Join live game</span>
          </Link>
        ))}
        {todo.length > 0 && (
          <Link to="/classes" className="card todo-banner">
            <OrganelleIcon id="golgi" size={40} />
            <span className="grow">
              <strong>
                {todo.length} assignment{todo.length === 1 ? '' : 's'} to do
              </strong>
              <span className="muted small"> · next: {todo[0].title}</span>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <InstallCard />
      </div>

      {/* ---------- Learning through play ---------- */}
      <section className="split">
        <div className="split-text">
          <h2 className="display">
            Learning Through <Squiggle>Joyful Play.</Squiggle>
          </h2>
          <p>
            Every student is a natural explorer. Cell Quest isn’t about memorising a list — it’s about tapping, building, unscrambling and discovering. Each
            answer comes with an explanation, so mistakes turn into lessons.
          </p>
          <div className="hero-ctas left">
            <CurlyArrow className="split-arrow" />
            <Link to="/play/daily" className="btn coral">
              {dailyDone ? 'Replay Daily Challenge' : 'Play Today’s Challenge'}
            </Link>
            <Link to="/learn" className="btn outline">
              Open the Cell Library
            </Link>
          </div>
          <div className="feature-pair">
            <div className="feature">
              <span className="icon-circle green">
                <OrganelleIcon id="chloroplast" size={30} />
              </span>
              <div>
                <strong>Active Discovery</strong>
                <span>Hands-on puzzles that spark curiosity.</span>
              </div>
            </div>
            <div className="feature">
              <span className="icon-circle green">
                <OrganelleIcon id="vesicle" size={30} />
              </span>
              <div>
                <strong>Play Together</strong>
                <span>Challenge friends to the same questions.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="split-art">
          <Sparks className="split-sparks" color="var(--coral)" />
          <BlobFrame tone="yellow" className="split-main">
            <CellDiagram type="animal" labels />
          </BlobFrame>
          <BlobFrame tone="green" className="split-small">
            <OrganelleIcon id="nucleus" size={110} />
          </BlobFrame>
        </div>
      </section>

      {/* ---------- Programs (featured games) ---------- */}
      <section className="center-section">
        <h2 className="display center">
          Tailored Games for <br />
          Every <Squiggle>Learner.</Squiggle>
        </h2>
        <p className="muted center">Quick daily rounds, a race against the clock, or a hands-on puzzle — pick your favourite.</p>
        <div className="program-row">
          {programs.map(({ mode, tone, art, label, big }) => (
            <Link key={mode.id} to={`/play/${mode.id}`} className={`program-card tone-${tone} ${big ? 'big' : ''}`}>
              <div className="program-art">{art}</div>
              <div className="program-foot">
                <span className="mini-tag">{label}</span>
                <strong>{mode.name}</strong>
                {big && <span className="program-blurb">{mode.blurb}</span>}
              </div>
            </Link>
          ))}
        </div>
        <Link to="/play" className="btn outline">
          See all {MODES.filter((m) => !m.hidden).length} games
        </Link>
      </section>

      {/* ---------- Progress ("A safe space to shine") ---------- */}
      <section className="center-section shine">
        <BunnyBuddy className="buddy-left" />
        <BlobBuddy className="buddy-right" />
        <h2 className="display center">
          A Safe Space <br />
          to <Squiggle>Shine.</Squiggle>
        </h2>
        <div className="shine-row">
          <div className="shine-item">
            <span className="icon-circle yellow">
              <RankBadge level={rank.level} size={36} />
            </span>
            <strong>{rank.name}</strong>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${rank.progress * 100}%` }} />
            </div>
            <span>{rank.next ? `${rank.next.xp - p.xp} XP to ${rank.next.name}` : 'Top rank reached!'}</span>
          </div>
          <div className="shine-item main">
            <BlobFrame tone="mint" tilt={-4} className="shine-photo">
              <Flame size={110} lit={p.daily.streak > 0} className={p.daily.streak > 0 ? 'flicker' : ''} />
            </BlobFrame>
            <span className="icon-circle green shield">
              <OrganelleIcon id="cellMembrane" size={28} />
            </span>
            <strong>
              {p.daily.streak}-day streak
            </strong>
            <span>Best: {p.daily.best} days. Play once a day to keep it alive.</span>
          </div>
          <div className="shine-item">
            <span className="icon-circle mint">
              <OrganelleIcon id="golgi" size={30} />
            </span>
            <strong>
              {p.badges.length}/{BADGES.length} badges
            </strong>
            <span>Mistakes are safe here — they become your review list.</span>
          </div>
        </div>
      </section>

      {/* ---------- A day in the cell (gallery) ---------- */}
      <section className="center-section">
        <h2 className="display center">
          A Day in the <Squiggle>Cell.</Squiggle>
        </h2>
        <p className="muted center">Meet the team that keeps every cell alive. Tap one to learn its job.</p>
        <div className="gallery">
          {ORGANELLES.slice(0, 8).map((o, i) => (
            <Link key={o.id} to={`/learn/${o.id}`} className={`gallery-tile tone-${GALLERY_TONES[i]} ${i === 2 || i === 6 ? 'wide' : ''}`}>
              <OrganelleIcon id={o.id} size={i === 2 || i === 6 ? 110 : 90} />
              <span className="gallery-cap">{o.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Friends ---------- */}
      <section className="center-section">
        <h2 className="display center">
          Made for Students. <br />
          Better with <Squiggle>Friends.</Squiggle>
        </h2>
        <div className="friend-cards">
          {[
            { icon: 'vesicle', color: '#ff8fb1', title: 'Send a request', text: 'Share your 6-letter friend code and add classmates.' },
            { icon: 'mitochondrion', color: '#ffe14d', title: 'Challenge a duel', text: 'Your friend gets the same 12 questions. Who scores more?' },
            { icon: 'chloroplast', color: '#9fdccf', title: 'Climb the board', text: 'Earn XP in any mode and rise up the leaderboard.' },
          ].map((c) => (
            <Link key={c.title} to="/friends" className="friend-card">
              <FlowerFrame color={c.color}>
                <OrganelleIcon id={c.icon} size={40} />
              </FlowerFrame>
              <strong>{c.title}</strong>
              <span>{c.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {p.mistakes.length > 0 && (
        <Link to="/mistakes" className="card mistakes-cta">
          <Mascot mood="think" size={56} />
          <div>
            <h3>Learn from your mistakes</h3>
            <p className="muted small">
              {p.mistakes.length} question{p.mistakes.length === 1 ? '' : 's'} to review. Fixing them removes them from the list.
            </p>
          </div>
        </Link>
      )}

      {intro && <Welcome onDone={() => setIntro(false)} />}
      {!intro && p.lostStreak > 0 && <StreakLostOverlay days={p.lostStreak} onClose={p.clearLostStreak} />}
    </div>
  );
}
