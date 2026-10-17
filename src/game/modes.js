// Every game mode: how it looks on the menu and how its round is built.
import { POOLS, build, exists } from './catalog.js';
import { makeRng, shuffle, take, todayKey } from './rng.js';

// round(rng, ctx) returns a list of question ids. ctx = { mistakes: [...] }
export const MODES = [
  {
    id: 'daily',
    name: 'Daily Cell Challenge',
    blurb: 'Ten mixed questions — the same for everyone today. Keeps your daily streak alive!',
    icon: 'nucleus',
    color: '#6d4fd1',
    featured: true,
    seed: () => `daily-${todayKey()}`,
    round: (rng) =>
      shuffle(
        [
          ...take(POOLS.mcq, 3, rng),
          ...take(POOLS.tf, 2, rng),
          ...take(POOLS.scramble, 1, rng),
          ...take(POOLS.label, 2, rng),
          ...take(POOLS.odd, 1, rng),
          ...take(POOLS.fill, 1, rng),
        ],
        rng,
      ),
  },
  {
    id: 'quick',
    name: '10-Minute Quick Quiz',
    blurb: 'Beat the clock! Answer as many mixed questions as you can in 10 minutes.',
    icon: 'mitochondrion',
    color: '#dc2626',
    featured: true,
    totalTime: 600,
    round: (rng) =>
      shuffle(
        [
          ...take(POOLS.mcq, 14, rng),
          ...take(POOLS.tf, 14, rng),
          ...take(POOLS.scramble, 5, rng),
          ...take(POOLS.label, 8, rng),
          ...take(POOLS.fill, 6, rng),
          ...take(POOLS.odd, 4, rng),
          ...take(POOLS.sort, 7, rng),
          ...take(POOLS.riddle, 4, rng),
        ],
        rng,
      ),
  },
  {
    id: 'sprint',
    name: 'Cell Sprint',
    blurb: 'Fifteen multiple-choice questions, 20 seconds each.',
    icon: 'ribosome',
    color: '#0f766e',
    timePer: 20,
    round: (rng) => take(POOLS.mcq, 15, rng),
  },
  {
    id: 'truefalse',
    name: 'True or False',
    blurb: 'Fast facts! Fifteen statements, 12 seconds each.',
    icon: 'lysosome',
    color: '#16a34a',
    timePer: 12,
    round: (rng) => take(POOLS.tf, 15, rng),
  },
  {
    id: 'scramble',
    name: 'Scramble Lab',
    blurb: 'Read the meaning, job and type, then unscramble the word.',
    icon: 'golgi',
    color: '#e11d48',
    round: (rng) => take(POOLS.scramble, 8, rng),
  },
  {
    id: 'riddles',
    name: 'Organelle Detective',
    blurb: 'Solve riddles from clues. Using a hint halves the points.',
    icon: 'vesicle',
    color: '#db2777',
    round: (rng) => take(POOLS.riddle, 8, rng),
  },
  {
    id: 'label',
    name: 'Label the Diagram',
    blurb: 'Tap the right part of animal and plant cells — or name the glowing part.',
    icon: 'cytoplasm',
    color: '#0891b2',
    round: (rng) => take(POOLS.label, 10, rng),
  },
  {
    id: 'match',
    name: 'Match the Function',
    blurb: 'Connect each structure to its job. Three boards of five.',
    icon: 'roughER',
    color: '#2563eb',
    round: (rng) => [0, 1, 2].map((i) => `mt-${Math.floor(rng() * 1e6)}-${i}`),
  },
  {
    id: 'build',
    name: 'Build-a-Cell',
    blurb: 'Assemble a plant and an animal cell. Don’t add parts that don’t belong!',
    icon: 'cellWall',
    color: '#65a30d',
    round: (rng) => shuffle(POOLS.build, rng),
  },
  {
    id: 'sort',
    name: 'Plant, Animal or Both?',
    blurb: 'Sort each feature into the right kind of cell.',
    icon: 'chloroplast',
    color: '#15803d',
    round: (rng) => take(POOLS.sort, 12, rng),
  },
  {
    id: 'fill',
    name: 'Fill the Gap',
    blurb: 'Complete each sentence with the missing word.',
    icon: 'smoothER',
    color: '#0284c7',
    round: (rng) => take(POOLS.fill, 10, rng),
  },
  {
    id: 'odd',
    name: 'Odd One Out',
    blurb: 'Spot the one that doesn’t belong — then learn why.',
    icon: 'centrosome',
    color: '#d97706',
    round: (rng) => take(POOLS.odd, 8, rng),
  },
  {
    id: 'twopart',
    name: 'Two-Part Challenge',
    blurb: 'Answer part A and part B in your own words, then mark yourself.',
    icon: 'nucleolus',
    color: '#7c3aed',
    round: (rng) => take(POOLS.twoPart, 5, rng),
  },
  {
    id: 'voice',
    name: 'Voice Lab',
    blurb: 'Questions are read aloud — say your answer out loud!',
    icon: 'cellMembrane',
    color: '#9333ea',
    voice: true,
    round: (rng) => shuffle([...take(POOLS.mcq, 5, rng), ...take(POOLS.tf, 3, rng), ...take(POOLS.riddle, 2, rng)], rng),
  },
  {
    id: 'mistakes',
    name: 'Fix My Mistakes',
    blurb: 'Replay questions you got wrong until they stick.',
    icon: 'cytoskeleton',
    color: '#475569',
    hidden: true,
    round: (rng, ctx) => take(ctx.mistakes.filter(exists), 12, rng),
  },
  {
    id: 'duel',
    name: 'Friend Duel',
    blurb: 'Twelve mixed questions — same questions for both players.',
    icon: 'vacuole',
    color: '#0ea5e9',
    hidden: true,
    timePer: 25,
    round: (rng) =>
      shuffle(
        [...take(POOLS.mcq, 4, rng), ...take(POOLS.tf, 3, rng), ...take(POOLS.label, 2, rng), ...take(POOLS.scramble, 1, rng), ...take(POOLS.odd, 1, rng), ...take(POOLS.sort, 1, rng)],
        rng,
      ),
  },
];

export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m]));

export function buildRound(modeId, seed, ctx = { mistakes: [] }) {
  const mode = MODE_BY_ID[modeId];
  const rng = makeRng(seed);
  return mode
    .round(rng, ctx)
    .map((id) => build(id, rng))
    .filter(Boolean);
}
