// EMBER COURT — screenshot presets: fixed scenes of the real game, reached by
// ?shot=title|play|win|loss&seed=N. The maker uses these to photograph the game
// in the browser; nothing here edits or composites an image, it only sets the
// starting state before the same render code draws the table.

import { newGameState, addLog } from './game.js';
import { cardById } from './cards.js';

// A small seeded RNG so a shot is the same every time it is taken.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickHand(ids) {
  return ids.map((id, i) => ({ ...cardById(id), uid: `${id}-shot-${i}` }));
}

export function applyShotPreset(shot, seed) {
  const state = newGameState(mulberry32(seed || 7));
  if (shot === 'title') {
    state.phase = 'title';
    return state;
  }
  if (shot === 'win') {
    state.phase = 'won';
    state.score = 87;
    state.round = 6;
    state.damageDealt = 62;
    state.you.life = 11;
    state.foe.life = 0;
    state.lastPlay = 'The Ash Baron falls. The court is yours!';
    return state;
  }
  if (shot === 'loss') {
    state.phase = 'lost';
    state.score = 34;
    state.round = 8;
    state.damageDealt = 41;
    state.you.life = 0;
    state.foe.life = 9;
    state.lastPlay = 'Your ember gutters out. The court keeps its king.';
    return state;
  }
  // 'play': a mid-duel table, round 4, both sides bloodied.
  state.phase = 'playing';
  state.round = 4;
  state.score = 23;
  state.damageDealt = 23;
  state.you.life = 18;
  state.you.shield = 4;
  state.you.ember = 5;
  state.you.hand = pickHand(['inferno', 'mend', 'bramble', 'bulwark', 'surge']);
  state.foe.life = 14;
  state.foe.shield = 2;
  state.foe.ember = 4;
  state.foe.hand = pickHand(['strike', 'strike', 'mend', 'rampart', 'leech']);
  state.foe.poison = 2;
  state.foe.poisonTurns = 2;
  state.lastPlay = 'You play BRAMBLE — 2 damage and poison!';
  state.log = [];
  addLog(state, 'You play BRAMBLE — 2 damage and poison!');
  addLog(state, 'The Ash Baron plays BULWARK — gains 4 shield.');
  addLog(state, 'You play STRIKE — 3 damage.');
  addLog(state, 'Poison bites the Ash Baron for 2.');
  addLog(state, 'Round 4 — your move. 3 ember, 2 cards drawn.');
  return state;
}
