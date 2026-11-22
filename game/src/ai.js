// EMBER COURT — the Ash Baron's brain: a readable, counterable heuristic.
// He can be read: he strikes for the kill when he sees it, shields when he is
// bleeding, heals when he is hurt, and otherwise spends his ember on damage.
// He never plays a card he cannot afford, and he stops when his ember runs out.

import { cardById } from './cards.js';

// Score one card in the Baron's hand. Higher wins; -1 means "never play this now".
export function scoreFoeCard(card, foe, you) {
  if (card.cost > foe.ember) return -1;
  switch (card.kind) {
    case 'damage':
    case 'damage_draw':
    case 'damage_heal': {
      // Lethal damage beats everything.
      if (card.value >= you.life + you.shield) return 1000 + card.value;
      return 40 + card.value * 3 - card.cost * 2;
    }
    case 'poison':
      if (you.life <= 6) return 90; // finish a wounded challenger
      return 45 + card.value * 2;
    case 'heal':
      if (foe.life >= 22) return -1; // already hale
      return 30 + (24 - foe.life);
    case 'shield':
      if (you.life <= 5) return 5; // press the attack instead
      if (foe.life <= 10) return 70 + card.value; // turtle when hurt
      return 25 + card.value;
    case 'draw':
      return foe.hand.length <= 3 ? 35 : 5;
    case 'ember':
      return foe.ember <= 1 ? 30 : -1;
    default:
      return 0;
  }
}

// Pick the Baron's next card, or null when he is done for the turn.
export function pickFoeCard(foe, you) {
  let best = null;
  let bestScore = 0;
  for (const card of foe.hand) {
    const score = scoreFoeCard(card, foe, you);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

// Play the Baron's whole turn, one card at a time, with a pause between plays
// so the player can watch his hand shrink. `step` is called after each play;
// `done` when he ends his turn. Returns the list of played card ids (for tests).
export function runFoeTurn(state, applyOne, step, done) {
  const played = [];
  const think = () => {
    if (state.phase !== 'playing') { done(played); return; }
    const card = pickFoeCard(state.foe, state.you);
    if (!card) { done(played); return; }
    state.foe.hand = state.foe.hand.filter((c) => c.uid !== card.uid);
    state.foe.ember -= card.cost;
    const line = applyOne(state, card, state.foe, state.you, 'The Ash Baron');
    state.discard.push(card);
    played.push(card.id);
    step(line, card);
    window.setTimeout(think, 650);
  };
  window.setTimeout(think, 500);
  return played;
}

export { cardById };
