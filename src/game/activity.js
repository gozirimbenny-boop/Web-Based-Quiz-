// Teacher activities (assignments and live rooms): turning the teacher's
// choices into a fixed list of question ids, and building those questions
// for a student. The list is resolved once, when the teacher creates the
// activity, so every student gets exactly the same questions.
import { ALL_IDS, build, isChoiceQuestion, topicsOf, typeOf } from './catalog.js';
import { MODE_BY_ID } from './modes.js';
import { makeRng, shuffle } from './rng.js';

// Game modes a teacher can use. Live rooms need "pick an answer" modes.
export const ACTIVITY_MODES = ['sprint', 'truefalse', 'riddles', 'scramble', 'label', 'match', 'build', 'sort', 'fill', 'odd', 'twopart', 'quick', 'daily'];
export const LIVE_MODES = ['sprint', 'truefalse', 'riddles', 'label', 'sort', 'fill', 'odd', 'daily'];

// config: { source: 'mode'|'topics'|'pick', mode, count, topics[], types[], picked[] }
export function resolveQuestionIds(config, seed, { live = false } = {}) {
  const rng = makeRng(seed);
  let ids = [];
  if (config.source === 'mode') {
    ids = MODE_BY_ID[config.mode].round(rng, { mistakes: [] });
  } else if (config.source === 'topics') {
    const types = config.types?.length ? config.types : null;
    ids = shuffle(
      ALL_IDS.filter((id) => (!types || types.includes(typeOf(id))) && topicsOf(id).some((t) => config.topics.includes(t))),
      rng,
    );
  } else {
    ids = [...config.picked];
  }
  if (live) ids = ids.filter(isChoiceQuestion);
  if (config.count && config.source !== 'pick') ids = ids.slice(0, config.count);
  return ids;
}

// How many questions a topics/types selection can produce (for the picker).
export const countAvailable = (topics, types, live) =>
  ALL_IDS.filter((id) => (!types?.length || types.includes(typeOf(id))) && topicsOf(id).some((t) => topics.includes(t)) && (!live || isChoiceQuestion(id))).length;

// Builds the playable questions for one student. With `shuffle` on, each
// student gets their own order (and answer order); otherwise everyone's
// identical, so scores and per-question stats are comparable.
export function buildActivity(ids, seed, { shuffle: perStudent = false, uid = '' } = {}) {
  const key = perStudent ? uid : '';
  const order = perStudent ? shuffle(ids, makeRng(`${seed}:${uid}`)) : ids;
  return order.map((id) => build(id, makeRng(`${seed}:${key}:${id}`))).filter(Boolean);
}
