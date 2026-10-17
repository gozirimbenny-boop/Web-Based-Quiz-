// The quiz engine used by every mode: countdown → questions → results.
// Handles per-question timers, the 10-minute total timer, scoring, answer
// streaks (combos), feedback animations and the results screen.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ChoiceQuestion, { speechFor } from '../questions/ChoiceQuestion.jsx';
import ScrambleQuestion from '../questions/ScrambleQuestion.jsx';
import LabelTapQuestion from '../questions/LabelTapQuestion.jsx';
import MatchQuestion from '../questions/MatchQuestion.jsx';
import BuildQuestion from '../questions/BuildQuestion.jsx';
import TwoPartQuestion from '../questions/TwoPartQuestion.jsx';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import Mascot from '../art/Mascot.jsx';
import { Clock, Flame, Speaker, Trophy } from '../art/Icons.jsx';
import { BadgeToasts, Burst, Confetti, CountUp, Countdown, LevelUpOverlay, oops, praise } from './Effects.jsx';
import { useProgress } from '../game/progress.jsx';
import { exists, summary } from '../game/catalog.js';
import { play } from '../game/sound.js';
import { canSpeak, speak, stopSpeaking } from '../game/voice.js';

const COMPONENTS = {
  choice: ChoiceQuestion,
  scramble: ScrambleQuestion,
  labelTap: LabelTapQuestion,
  match: MatchQuestion,
  build: BuildQuestion,
  twoPart: TwoPartQuestion,
};

const COMBO_MILESTONES = [3, 5, 10, 15, 20, 30];
const PERFECT_BONUS = 5;

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

function readAloudText(q) {
  if (q.kind === 'choice') return speechFor(q);
  if (q.kind === 'scramble') return `Unscramble the word. Meaning: ${q.clue.meaning} Function: ${q.clue.fn}`;
  if (q.kind === 'twoPart') return `Part A: ${q.a} Part B: ${q.b}`;
  return q.prompt;
}

export default function QuizRunner({ mode, questions, onFinish, onReplay, extraResults }) {
  const progress = useProgress();
  const [phase, setPhase] = useState('countdown'); // countdown | play | results
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { id, correct, points, max, given }
  const [current, setCurrent] = useState(null); // result for the current question
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [burst, setBurst] = useState(null);
  const [qTime, setQTime] = useState(mode.timePer || 0);
  const [totalLeft, setTotalLeft] = useState(mode.totalTime || 0);
  const [outcome, setOutcome] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const burstKey = useRef(0);
  const finished = useRef(false);

  const q = questions[idx];
  const answered = !!current;

  const flash = (type, text, n) => {
    burstKey.current += 1;
    setBurst({ type, text, n, key: burstKey.current });
  };
  useEffect(() => {
    if (!burst) return undefined;
    const t = setTimeout(() => setBurst(null), burst.type === 'streakLost' ? 1600 : 1100);
    return () => clearTimeout(t);
  }, [burst]);

  const finishRound = useCallback(
    (finalAnswers, finalBest) => {
      if (finished.current) return;
      finished.current = true;
      stopSpeaking();
      const score = finalAnswers.reduce((s, a) => s + a.points, 0);
      const max = finalAnswers.reduce((s, a) => s + a.max, 0);
      // For timed rounds, unanswered questions don't count toward max.
      const result = progress.recordRound({
        modeId: mode.id,
        score,
        max,
        correctIds: finalAnswers.filter((a) => a.correct && exists(a.id)).map((a) => a.id),
        wrongIds: finalAnswers.filter((a) => !a.correct && exists(a.id)).map((a) => a.id),
        bestCombo: finalBest,
        correctCount: finalAnswers.filter((a) => a.correct).length,
        answeredCount: finalAnswers.length,
      });
      const pct = max ? score / max : 0;
      play(pct >= 0.7 ? 'win' : pct >= 0.4 ? 'correct' : 'lose');
      setOutcome({ ...result, score, max, pct });
      setPhase('results');
      if (result.levelUp) setTimeout(() => setShowLevelUp(true), 1600);
      onFinish?.({ score, max });
    },
    [mode.id, onFinish, progress],
  );

  const handleAnswer = useCallback(
    (res) => {
      if (current || finished.current) return;
      const entry = { id: q.id, ...res };
      setCurrent(entry);
      const next = [...answers, entry];
      setAnswers(next);
      if (res.correct) {
        const c = combo + 1;
        setCombo(c);
        setBestCombo((b) => Math.max(b, c));
        if (COMBO_MILESTONES.includes(c)) {
          play('combo');
          flash('combo', `${c} in a row!`, c);
        } else {
          play('correct');
          flash('correct', praise());
        }
      } else {
        if (combo >= 3) {
          play('streakLost');
          flash('streakLost', 'Streak lost!', combo);
        } else if (res.timeUp) {
          play('timeUp');
          flash('timeUp', 'Time’s up!');
        } else if (res.partial) {
          play('correct');
          flash('partial', 'Good effort!');
        } else {
          play('wrong');
          flash('wrong', oops());
        }
        setCombo(0);
      }
    },
    [answers, combo, current, q],
  );

  const goNext = useCallback(() => {
    stopSpeaking();
    if (idx + 1 >= questions.length) {
      finishRound(answers, bestCombo);
      return;
    }
    setIdx(idx + 1);
    setCurrent(null);
    setQTime(mode.timePer || 0);
  }, [answers, bestCombo, finishRound, idx, mode.timePer, questions.length]);

  // Auto-advance after a correct answer in timed modes (keeps the pace up).
  useEffect(() => {
    if (!current || phase !== 'play') return undefined;
    const fast = (mode.timePer || mode.totalTime) && current.correct;
    if (!fast) return undefined;
    const t = setTimeout(goNext, 1000);
    return () => clearTimeout(t);
  }, [current, goNext, mode.timePer, mode.totalTime, phase]);

  // Per-question timer.
  useEffect(() => {
    if (phase !== 'play' || !mode.timePer || answered) return undefined;
    if (qTime <= 0) {
      handleAnswer({ correct: false, points: 0, max: q.points, timeUp: true, given: '(no answer)' });
      return undefined;
    }
    const t = setTimeout(() => {
      if (qTime <= 4) play('tick');
      setQTime((x) => x - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, qTime, answered, mode.timePer, handleAnswer, q]);

  // Whole-round timer (10-Minute Quick Quiz).
  useEffect(() => {
    if (phase !== 'play' || !mode.totalTime) return undefined;
    if (totalLeft <= 0) {
      play('timeUp');
      flash('timeUp', 'Time’s up!');
      const t = setTimeout(() => finishRound(answers, bestCombo), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (totalLeft <= 10) play('tick');
      setTotalLeft((x) => x - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, totalLeft, mode.totalTime]);

  // Enter = next.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && answered && phase === 'play' && e.target.tagName !== 'TEXTAREA') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, goNext, phase]);

  useEffect(() => () => stopSpeaking(), []);

  const score = answers.reduce((s, a) => s + a.points, 0);
  const startCountdown = useCallback(() => setPhase('play'), []);

  if (!questions.length) {
    return (
      <div className="card center">
        <Mascot mood="think" size={100} />
        <h2>No questions here yet</h2>
        <p className="muted">Play some rounds first — questions you miss will show up here.</p>
        <Link className="btn primary" to="/play">
          Choose a game
        </Link>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <Results
        outcome={outcome}
        onReplay={onReplay}
        answers={answers}
        questions={questions}
        bestCombo={bestCombo}
        showLevelUp={showLevelUp}
        closeLevelUp={() => setShowLevelUp(false)}
        extra={extraResults}
      />
    );
  }

  const Q = COMPONENTS[q.kind];
  const timerPct = mode.timePer ? (qTime / mode.timePer) * 100 : 0;

  return (
    <div className="quiz">
      {phase === 'countdown' && <Countdown title={mode.name} onDone={startCountdown} />}

      <div className="quiz-hud">
        <div className="hud-left">
          <span className="hud-mode">{mode.name}</span>
          <span className="hud-count">
            {mode.totalTime ? `Q${idx + 1}` : `${idx + 1} / ${questions.length}`}
          </span>
        </div>
        <div className="hud-right">
          {mode.totalTime > 0 && (
            <span className={`hud-total ${totalLeft <= 60 ? 'urgent' : ''}`}>
              <Clock size={18} /> {fmt(totalLeft)}
            </span>
          )}
          <span className={`hud-combo ${combo >= 3 ? 'hot' : ''}`} title="Answer streak">
            <Flame size={20} lit={combo > 0} /> {combo}
          </span>
          <span className="hud-score">{score} pts</span>
        </div>
      </div>

      {!mode.totalTime && (
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      )}
      {mode.timePer > 0 && (
        <div className="timer-track" aria-label={`${qTime} seconds left`}>
          <div className={`timer-fill ${qTime <= 5 ? 'low' : ''}`} style={{ width: `${timerPct}%` }} />
        </div>
      )}

      <div key={`${q.id}-${idx}`} className={`q-card ${answered ? (current.correct ? 'was-right' : current.partial ? 'was-partial' : 'was-wrong') : ''}`}>
        <div className="q-top">
          <span className="chip">{q.tag}</span>
          <span className="chip ghost">
            {q.points} {q.points === 1 ? 'pt' : 'pts'}
          </span>
          {canSpeak && !mode.voice && (
            <button className="icon-btn" onClick={() => speak(readAloudText(q))} aria-label="Read question aloud" title="Read aloud">
              <Speaker size={18} />
            </button>
          )}
        </div>
        {phase === 'play' && <Q q={q} answered={answered} onAnswer={handleAnswer} voice={mode.voice} />}

        {answered && (
          <div className={`explain ${current.correct ? 'good' : current.partial ? 'partial' : 'bad'}`}>
            <div className="explain-head">
              <Mascot mood={current.correct ? 'happy' : current.partial ? 'think' : 'sad'} size={46} />
              <strong>
                {current.correct
                  ? `Correct! +${current.points}`
                  : current.partial
                    ? `Partly right: +${current.points} of ${current.max}`
                    : current.timeUp
                      ? 'Out of time!'
                      : 'Not this time.'}
              </strong>
            </div>
            {q.kind === 'choice' && !current.correct && (
              <p>
                Answer: <strong>{q.choices[q.correct]}</strong>
              </p>
            )}
            {q.kind === 'scramble' && !current.correct && (
              <p>
                The word was <strong>{q.word}</strong>.
              </p>
            )}
            {q.explain && <p>{q.explain}</p>}
            {q.topic && <OrganelleIcon id={q.topic} size={34} className="explain-icon" />}
            <button className="btn primary" onClick={goNext} autoFocus>
              {idx + 1 >= questions.length ? 'See results' : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {mode.totalTime > 0 && (
        <button className="btn ghost small end-early" onClick={() => finishRound(answers, bestCombo)}>
          Finish now
        </button>
      )}

      <Burst burst={burst} />
    </div>
  );
}

function Results({ outcome, answers, questions, bestCombo, showLevelUp, closeLevelUp, extra, onReplay }) {
  const { score, max, pct, xpGained, newBadges, perfect, streak, streakExtended } = outcome;
  const tier = pct >= 0.7 ? 'win' : pct >= 0.4 ? 'ok' : 'lose';
  const missed = answers.filter((a) => !a.correct);
  const byId = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, q])), [questions]);
  const correctCount = answers.filter((a) => a.correct).length;

  return (
    <div className={`results results-${tier}`}>
      <Confetti fire={tier === 'win'} />
      <div className="results-hero">
        {tier === 'win' ? (
          <Trophy size={110} className="trophy-bounce" />
        ) : (
          <Mascot mood={tier === 'ok' ? 'happy' : 'sad'} size={110} className={tier === 'lose' ? 'wobble' : 'bounce'} />
        )}
        <h1>{tier === 'win' ? (perfect ? 'Perfect round!' : 'Great job!') : tier === 'ok' ? 'Nice effort!' : 'Try again!'}</h1>
        <p className="muted">
          {tier === 'win'
            ? 'You’re a natural cell scientist.'
            : tier === 'ok'
              ? 'You’re getting there — one more round?'
              : 'Every scientist learns from mistakes. Check the review below and give it another go!'}
        </p>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">
            <CountUp to={score} />/{max}
          </span>
          <span className="stat-label">points</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            +<CountUp to={xpGained} />
          </span>
          <span className="stat-label">XP</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {correctCount}/{answers.length}
          </span>
          <span className="stat-label">correct</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            <Flame size={22} /> {bestCombo}
          </span>
          <span className="stat-label">best streak</span>
        </div>
      </div>

      {perfect && <p className="bonus-pill">✨ Perfect-round bonus: +{PERFECT_BONUS} points (+50 XP)</p>}
      {streakExtended && (
        <p className="streak-pill">
          <Flame size={20} /> Daily streak: {streak} day{streak === 1 ? '' : 's'}!
        </p>
      )}

      {extra}

      <div className="row center gap wrap">
        <button className={`btn primary big ${tier === 'lose' ? 'pulse' : ''}`} onClick={onReplay}>
          {tier === 'lose' ? 'Try again' : 'Play again'}
        </button>
        <Link className="btn ghost big" to="/play">
          Other games
        </Link>
      </div>

      {missed.length > 0 && (
        <section className="review">
          <h2>Learn from mistakes</h2>
          <ul>
            {missed.map((a, i) => {
              const q = byId[a.id];
              const s = exists(a.id) ? summary(a.id) : null;
              return (
                <li key={`${a.id}-${i}`} className="review-item">
                  <span className="chip">{q?.tag}</span>
                  <p className="review-q">{s?.prompt || q?.prompt}</p>
                  {a.given && <p className="review-given">Your answer: {a.given}</p>}
                  {s?.answer && (
                    <p className="review-answer">
                      Correct answer: <strong>{s.answer}</strong>
                    </p>
                  )}
                  {(s?.explain || q?.explain) && <p className="muted small">{s?.explain || q?.explain}</p>}
                </li>
              );
            })}
          </ul>
          <Link className="btn ghost" to="/mistakes">
            See all my mistakes
          </Link>
        </section>
      )}

      <BadgeToasts ids={newBadges} />
      {showLevelUp && outcome.levelUp && <LevelUpOverlay rank={outcome.levelUp} onClose={closeLevelUp} />}
    </div>
  );
}
