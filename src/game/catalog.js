// Turns the raw question bank into "playable" questions that the quiz
// engine understands. Every playable question has:
//   id, kind ('choice' | 'scramble' | 'labelTap' | 'match' | 'build' | 'twoPart'),
//   tag (shown as a small chip), points (max points), plus kind-specific fields.
import { ORGANELLES, ORGANELLE_BY_ID } from '../data/organelles.js';
import { MCQ, TRUE_FALSE, RIDDLES, SCRAMBLES, FILL, ODD_ONE_OUT, SORT, TWO_PART, BUILDS } from '../data/questions.js';
import { CELLS } from '../art/CellDiagram.jsx';
import { shuffle, take } from './rng.js';

const nameOf = (id) => ORGANELLE_BY_ID[id].name;

// Choices are shuffled, but the correct answer is tracked by its text.
function choice(base, { tag, prompt, choices, answer, explain, points = 1, layout, rng, keepOrder, ...rest }) {
  const correctText = choices[answer];
  const list = keepOrder ? choices : shuffle(choices, rng);
  return {
    id: base.id,
    kind: 'choice',
    tag,
    prompt,
    choices: list,
    correct: list.indexOf(correctText),
    explain,
    points,
    layout,
    ...rest,
  };
}

export function scrambleWord(word, rng) {
  if (word.length < 2) return word;
  let out = word;
  for (let i = 0; i < 10 && out === word; i++) out = shuffle(word.split(''), rng).join('');
  return out;
}

const sameLetters = (a, b) => a.split('').sort().join('') === b.split('').sort().join('');

function organelleChoices(answerId, rng, pool = ORGANELLES.map((o) => o.id)) {
  const others = take(pool.filter((id) => id !== answerId), 3, rng);
  return [answerId, ...others];
}

const builders = {
  mc: (q, rng) =>
    choice(q, { tag: 'Multiple choice', prompt: q.q, choices: q.choices, answer: q.answer, explain: q.explain, topic: q.topic, rng }),

  tf: (q, rng) =>
    choice(q, {
      tag: 'True or false',
      prompt: q.q,
      choices: ['True', 'False'],
      answer: q.answer ? 0 : 1,
      explain: q.explain,
      layout: 'tf',
      keepOrder: true,
      rng,
    }),

  rd: (q, rng) => {
    const ids = organelleChoices(q.answer, rng);
    return choice(q, {
      tag: 'Riddle',
      prompt: q.q,
      choices: ids.map(nameOf),
      answer: 0,
      explain: `${nameOf(q.answer)}: ${ORGANELLE_BY_ID[q.answer].fn}`,
      points: 2,
      hint: q.hint,
      topic: q.answer,
      rng,
    });
  },

  fb: (q, rng) => choice(q, { tag: 'Fill the gap', prompt: q.q, choices: q.choices, answer: q.answer, explain: q.explain, layout: 'fill', rng }),

  od: (q, rng) =>
    choice(q, { tag: 'Odd one out', prompt: 'Which one is the odd one out?', choices: q.choices, answer: q.answer, explain: q.explain, rng }),

  pa: (q, rng) =>
    choice(q, {
      tag: 'Plant, animal or both?',
      prompt: q.q,
      choices: ['Plant', 'Animal', 'Both'],
      answer: { plant: 0, animal: 1, both: 2 }[q.answer],
      explain: q.explain || `${q.q}: ${{ plant: 'typical of plant cells', animal: 'typical of animal cells', both: 'found in both plant and animal cells' }[q.answer]}.`,
      layout: 'sort',
      keepOrder: true,
      rng,
    }),

  sc: (q, rng) => {
    const o = q.organelle && ORGANELLE_BY_ID[q.organelle];
    const clue = o ? { meaning: o.meaning, fn: o.fn, kind: o.kind } : q.clue;
    return {
      id: q.id,
      kind: 'scramble',
      tag: 'Scramble',
      word: q.word,
      // Use the given scramble only if it really uses the answer's letters
      // (a few in the source PDF don't), otherwise make our own.
      scrambled: q.scrambled && sameLetters(q.scrambled, q.word) ? q.scrambled : scrambleWord(q.word, rng),
      clue,
      icon: q.organelle,
      explain: o ? `${o.name} — ${o.fn}` : `${q.word}: ${clue.fn}`,
      points: 2,
    };
  },

  ab: (q) => ({ id: q.id, kind: 'twoPart', tag: 'Two-part challenge', ...q, points: 2 }),

  // Label the diagram: "lbl-<cell>-<part>-tap" or "lbl-<cell>-<part>-name"
  lbl: (q, rng) => {
    const [, cell, part, mode] = q.id.split('-');
    const o = ORGANELLE_BY_ID[part];
    if (mode === 'tap') {
      return {
        id: q.id,
        kind: 'labelTap',
        tag: 'Label the diagram',
        prompt: `Tap the ${o.name} in this ${cell} cell.`,
        cell,
        target: part,
        explain: `${o.name}: ${o.fn}`,
        points: 1,
      };
    }
    const pool = CELLS[cell].order;
    const ids = organelleChoices(part, rng, pool);
    return choice(q, {
      tag: 'Label the diagram',
      prompt: `What is the highlighted part of this ${cell} cell?`,
      choices: ids.map(nameOf),
      answer: 0,
      explain: `${o.name}: ${o.fn}`,
      art: { cell, highlight: part },
      topic: part,
      rng,
    });
  },

  // Match the function: "mt-<seed>" carries no data; pairs are chosen by rng.
  mt: (q, rng) => {
    const picks = take(ORGANELLES, 5, rng);
    return {
      id: q.id,
      kind: 'match',
      tag: 'Match the function',
      prompt: 'Match each structure to its job.',
      pairs: picks.map((o) => ({ id: o.id, left: o.name, right: o.match })),
      points: picks.length,
    };
  },

  bd: (q) => {
    const cell = q.id === 'bd-plant' ? 'plant' : 'animal';
    return {
      id: q.id,
      kind: 'build',
      tag: 'Build-a-Cell',
      prompt: `Build a typical ${cell} cell! Tap every part that belongs — avoid the ones that don’t.`,
      cell,
      needs: BUILDS[cell].needs,
      wrong: BUILDS[cell].wrong,
      points: BUILDS[cell].needs.length,
    };
  },
};

// ---- ID lists for each pool ----
const LABEL_IDS = ['animal', 'plant'].flatMap((cell) =>
  CELLS[cell].order.flatMap((part) => [`lbl-${cell}-${part}-tap`, `lbl-${cell}-${part}-name`]),
);

export const POOLS = {
  mcq: MCQ.map((q) => q.id),
  tf: TRUE_FALSE.map((q) => q.id),
  riddle: RIDDLES.map((q) => q.id),
  scramble: SCRAMBLES.map((q) => q.id),
  fill: FILL.map((q) => q.id),
  odd: ODD_ONE_OUT.map((q) => q.id),
  sort: SORT.map((q) => q.id),
  twoPart: TWO_PART.map((q) => q.id),
  label: LABEL_IDS,
  build: ['bd-animal', 'bd-plant'],
};

// Raw question data by id (generated ids are handled in build()).
const RAW = Object.fromEntries(
  [...MCQ, ...TRUE_FALSE, ...RIDDLES, ...SCRAMBLES, ...FILL, ...ODD_ONE_OUT, ...SORT, ...TWO_PART].map((q) => [q.id, q]),
);

const prefixOf = (id) => id.match(/^[a-z]+/)[0];

export function build(id, rng = Math.random) {
  const prefix = prefixOf(id);
  const fn = builders[prefix];
  if (!fn) return null;
  return fn(RAW[id] || { id }, rng);
}

export const exists = (id) => !!RAW[id] || LABEL_IDS.includes(id) || POOLS.build.includes(id);

// A short text version of any question — used on the mistakes page.
export function summary(id) {
  const q = RAW[id];
  if (!q) {
    if (id.startsWith('lbl-')) {
      const [, cell, part] = id.split('-');
      return { prompt: `Find the ${nameOf(part)} on the ${cell} cell`, answer: nameOf(part), explain: ORGANELLE_BY_ID[part].fn };
    }
    if (id.startsWith('mt-')) return { prompt: `Match the Function board ${Number(id.split('-')[2]) + 1}`, answer: '', explain: '' };
    if (id.startsWith('bd-')) return { prompt: `Build-a-Cell: ${id.slice(3)} cell`, answer: '', explain: '' };
    return { prompt: id, answer: '', explain: '' };
  }
  const p = prefixOf(id);
  if (p === 'mc' || p === 'fb') return { prompt: q.q, answer: q.choices[q.answer], explain: q.explain };
  if (p === 'tf') return { prompt: q.q, answer: q.answer ? 'True' : 'False', explain: q.explain };
  if (p === 'rd') return { prompt: q.q, answer: nameOf(q.answer), explain: ORGANELLE_BY_ID[q.answer].fn };
  if (p === 'od') return { prompt: `Odd one out: ${q.choices.join(', ')}`, answer: q.choices[q.answer], explain: q.explain };
  if (p === 'pa') return { prompt: `Plant, animal or both: ${q.q}`, answer: q.answer[0].toUpperCase() + q.answer.slice(1), explain: q.explain || '' };
  if (p === 'sc') return { prompt: 'Unscramble the word', answer: q.word, explain: q.organelle ? ORGANELLE_BY_ID[q.organelle].fn : q.clue.fn };
  if (p === 'ab') return { prompt: `A. ${q.a} B. ${q.b}`, answer: `A. ${q.ansA} B. ${q.ansB}`, explain: '' };
  return { prompt: id, answer: '', explain: '' };
}

// ---------- Topics (for teacher activities) ----------
// Which organelles a question is about. Uses the explicit field where the
// bank has one, otherwise looks for organelle names in the question text.
const KEYWORDS = {
  nucleus: /\bnucle(us|i)\b|\bDNA\b|nuclear/i,
  nucleolus: /nucleol/i,
  mitochondrion: /mitochondri|\bATP\b|respiration/i,
  ribosome: /ribosom|protein synth/i,
  roughER: /rough (ER|endoplasmic)/i,
  smoothER: /smooth (ER|endoplasmic)|detoxif|lipid/i,
  golgi: /golgi/i,
  lysosome: /lysosom|digestive enzyme/i,
  vesicle: /vesicle/i,
  cellMembrane: /membrane|osmosis|permeable|hypotonic/i,
  cytoplasm: /cytoplasm|cytosol|glycolysis/i,
  cytoskeleton: /cytoskeleton|microtubule|microfilament|filament/i,
  centrosome: /centr(iole|osome)/i,
  chloroplast: /chloroplast|chlorophyll|photosynth/i,
  cellWall: /cell wall|cellulose/i,
  vacuole: /vacuole|turgor/i,
};

// Wrong answer options don't count (a Golgi question that lists
// "Chloroplast" as a distractor isn't about chloroplasts) — except in Odd
// One Out, where all the options are the content.
const textOf = (q, p) =>
  [q.q, q.a, q.b, q.ansA, q.ansB, q.explain, q.word, ...(p === 'od' ? q.choices : typeof q.answer === 'number' && q.choices ? [q.choices[q.answer]] : [])]
    .filter(Boolean)
    .join(' ');

export function topicsOf(id) {
  const p = prefixOf(id);
  if (p === 'lbl') return [id.split('-')[2]];
  if (p === 'bd') return BUILDS[id === 'bd-plant' ? 'plant' : 'animal'].needs;
  const q = RAW[id];
  if (!q) return [];
  const found = new Set();
  if (q.topic) found.add(q.topic);
  if (p === 'rd') found.add(q.answer);
  if (q.organelle) found.add(q.organelle);
  const text = textOf(q, p);
  Object.entries(KEYWORDS).forEach(([org, re]) => re.test(text) && found.add(org));
  return [...found];
}

// Question types a teacher can filter by, with the pools they come from.
export const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple choice' },
  { id: 'tf', label: 'True / false' },
  { id: 'riddle', label: 'Riddles' },
  { id: 'scramble', label: 'Scrambles' },
  { id: 'fill', label: 'Fill the gap' },
  { id: 'odd', label: 'Odd one out' },
  { id: 'sort', label: 'Plant / animal / both' },
  { id: 'label', label: 'Label the diagram' },
  { id: 'twoPart', label: 'Two-part (written)' },
];

// Every question id in the bank (Build-a-Cell and Match are generated
// per round, so they're picked through game modes instead).
export const ALL_IDS = QUESTION_TYPES.flatMap((t) => POOLS[t.id]);
export const typeOf = (id) => QUESTION_TYPES.find((t) => POOLS[t.id].includes(id))?.id;

// Live rooms show one answer grid to everyone, so only "pick an answer"
// questions work there.
export const isChoiceQuestion = (id) => {
  const p = prefixOf(id);
  if (p === 'lbl') return id.endsWith('-name');
  return ['mc', 'tf', 'rd', 'fb', 'od', 'pa'].includes(p);
};
