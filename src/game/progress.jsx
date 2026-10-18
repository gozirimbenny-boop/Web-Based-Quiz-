// Player progress: XP, ranks, daily streak, badges and mistakes.
// Saved in this browser (localStorage); synced to Firebase when signed in.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { todayKey } from './rng.js';
import { setMuted } from './sound.js';

const KEY = 'cellquest.progress.v1';

export const RANKS = [
  { name: 'Cell Rookie', xp: 0 },
  { name: 'Organelle Explorer', xp: 150 },
  { name: 'Lab Assistant', xp: 400 },
  { name: 'Cell Scientist', xp: 800 },
  { name: 'Senior Cell Scientist', xp: 1500 },
  { name: 'Master Biologist', xp: 2500 },
];

export const rankFor = (xp) => {
  let level = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.xp) level = i;
  });
  const next = RANKS[level + 1];
  return {
    level,
    ...RANKS[level],
    next,
    progress: next ? (xp - RANKS[level].xp) / (next.xp - RANKS[level].xp) : 1,
  };
};

export const BADGES = [
  { id: 'first', name: 'First Steps', desc: 'Finish your first round.', icon: 'cytoplasm' },
  { id: 'perfect', name: 'Flawless', desc: 'Finish a round with no mistakes.', icon: 'nucleus' },
  { id: 'combo10', name: 'On Fire', desc: 'Get 10 answers right in a row.', icon: 'mitochondrion' },
  { id: 'daily3', name: 'Habit Forming', desc: 'Play 3 days in a row.', icon: 'ribosome' },
  { id: 'daily7', name: 'Week Warrior', desc: 'Play 7 days in a row.', icon: 'golgi' },
  { id: 'quick', name: 'Beat the Clock', desc: 'Get 20+ right in the 10-Minute Quick Quiz.', icon: 'centrosome' },
  { id: 'voice', name: 'Loud & Proud', desc: 'Finish a Voice Lab round.', icon: 'cellMembrane' },
  { id: 'builder', name: 'Cell Architect', desc: 'Build both cells perfectly.', icon: 'cellWall' },
  { id: 'explorer', name: 'Explorer', desc: 'Play 8 different game modes.', icon: 'chloroplast' },
  { id: 'scholar', name: 'Scholar', desc: 'Answer 200 questions correctly.', icon: 'nucleolus' },
  { id: 'fixer', name: 'Fixer', desc: 'Finish a Fix My Mistakes round.', icon: 'lysosome' },
  { id: 'duelist', name: 'Duelist', desc: 'Play a friend duel.', icon: 'vesicle' },
];

const DEFAULT = {
  name: '',
  avatar: 'mitochondrion',
  xp: 0,
  games: 0,
  correct: 0,
  answered: 0,
  bestCombo: 0,
  daily: { streak: 0, best: 0, last: null },
  dailyDone: null,
  badges: [],
  modesPlayed: [],
  mistakes: [],
  history: [],
  muted: false,
  notify: false,
  seenIntro: false,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
};

const Ctx = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load);
  // Set when the player comes back after missing a day: drives the
  // "You lost your streak" animation on the home screen.
  const [lostStreak, setLostStreak] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage may be blocked — progress just won't persist */
    }
  }, [state]);

  useEffect(() => setMuted(state.muted), [state.muted]);

  // Check for a broken daily streak once on load.
  useEffect(() => {
    const { last, streak } = state.daily;
    if (streak > 0 && last && last !== todayKey() && last !== yesterdayKey()) {
      setLostStreak(streak);
      setState((s) => ({ ...s, daily: { ...s.daily, streak: 0 } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);

  // Called at the end of every round. Returns what happened, for the
  // results screen animations.
  const recordRound = useCallback(
    ({ modeId, score, max, correctIds, wrongIds, bestCombo, correctCount, answeredCount }) => {
      const s = stateRef.current;
      {
        const today = todayKey();
        const perfect = max > 0 && score === max;
        const firstDailyToday = modeId === 'daily' && s.dailyDone !== today;
        const xpGained = score * 10 + bestCombo * 2 + (perfect ? 50 : 0) + (firstDailyToday ? 30 : 0);
        const xp = s.xp + xpGained;

        // Daily streak: any finished round counts as playing today.
        let daily = s.daily;
        let streakExtended = false;
        if (daily.last !== today) {
          const streak = daily.last === yesterdayKey() ? daily.streak + 1 : 1;
          daily = { streak, best: Math.max(daily.best, streak), last: today };
          streakExtended = true;
        }

        const modesPlayed = s.modesPlayed.includes(modeId) ? s.modesPlayed : [...s.modesPlayed, modeId];
        const correctTotal = s.correct + correctCount;
        const mistakes = [...new Set([...wrongIds, ...s.mistakes.filter((id) => !correctIds.includes(id))])].slice(0, 80);

        const earned = new Set(s.badges);
        const give = (id, cond) => cond && earned.add(id);
        give('first', true);
        give('perfect', perfect);
        give('combo10', bestCombo >= 10);
        give('daily3', daily.streak >= 3);
        give('daily7', daily.streak >= 7);
        give('quick', modeId === 'quick' && correctCount >= 20);
        give('voice', modeId === 'voice');
        give('builder', modeId === 'build' && perfect);
        give('explorer', modesPlayed.length >= 8);
        give('scholar', correctTotal >= 200);
        give('fixer', modeId === 'mistakes');
        give('duelist', modeId === 'duel');
        const newBadges = [...earned].filter((b) => !s.badges.includes(b));

        const before = rankFor(s.xp);
        const after = rankFor(xp);
        const next = {
          ...s,
          xp,
          games: s.games + 1,
          correct: correctTotal,
          answered: s.answered + answeredCount,
          bestCombo: Math.max(s.bestCombo, bestCombo),
          daily,
          dailyDone: modeId === 'daily' ? today : s.dailyDone,
          badges: [...earned],
          modesPlayed,
          mistakes,
          history: [{ modeId, score, max, date: Date.now() }, ...s.history].slice(0, 30),
        };
        stateRef.current = next;
        setState(next);
        return {
          xpGained,
          perfect,
          newBadges,
          levelUp: after.level > before.level ? after : null,
          streak: daily.streak,
          streakExtended,
        };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      rank: rankFor(state.xp),
      update,
      recordRound,
      lostStreak,
      clearLostStreak: () => setLostStreak(0),
      reset: () => setState({ ...DEFAULT, seenIntro: true }),
    }),
    [state, update, recordRound, lostStreak],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useProgress = () => useContext(Ctx);
