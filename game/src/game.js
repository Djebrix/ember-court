// EMBER COURT — the game state machine: turns, ember, damage, shield, poison, score.
// Pure rules, no DOM here: `game.js` owns the state, `render.js` draws it, `ai.js` picks
// the Baron's plays. A duel ends when either side's life reaches 0.

import { buildDeck, shuffleDeck } from './cards.js';

export const MAX_LIFE = 30;
export const MAX_HAND = 7;
export const EMBER_PER_TURN = 3;
export const FOE_EMBER_PER_TURN = 2;
export const MAX_EMBER = 10;
export const START_HAND = 5;

export function newGameState(random) {
  const deck = shuffleDeck(buildDeck(), random);
  const state = {
    phase: 'title', // title | playing | won | lost
    round: 1,
    score: 0,
    damageDealt: 0,
    you: freshCombatant(),
    foe: freshCombatant(),
    deck,
    discard: [],
    log: [],
    lastPlay: 'The duel begins. Play a card.',
    playerTurn: true,
    busy: false,
  };
  drawCards(state, state.you, START_HAND);
  drawCards(state, state.foe, START_HAND);
  return state;
}

function freshCombatant() {
  return { life: MAX_LIFE, shield: 0, ember: EMBER_PER_TURN, hand: [], poison: 0, poisonTurns: 0 };
}

export function drawCards(state, who, count) {
  for (let i = 0; i < count; i++) {
    if (who.hand.length >= MAX_HAND) break;
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break;
      state.deck = shuffleDeck(state.discard, Math.random);
      state.discard = [];
    }
    who.hand.push(state.deck.pop());
  }
}

export function addLog(state, text) {
  state.log.unshift(text);
  if (state.log.length > 6) state.log.length = 6;
}

// Damage first eats shield, then life. Returns the life damage actually dealt.
export function dealDamage(state, target, amount, sourceName) {
  let remaining = amount;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) addLog(state, `${sourceName} hits the shield for ${absorbed}.`);
  }
  if (remaining > 0) {
    target.life = Math.max(0, target.life - remaining);
    if (target === state.foe) {
      state.damageDealt += remaining;
      state.score += remaining;
    }
  }
  return remaining;
}

export function healCombatant(target, amount) {
  const healed = Math.min(amount, MAX_LIFE - target.life);
  target.life += healed;
  return healed;
}

// Apply one card's effect. Returns a human-readable line for the table.
export function playCardEffect(state, card, attacker, defender, attackerName) {
  const lines = [];
  switch (card.kind) {
    case 'damage': {
      const dealt = dealDamage(state, defender, card.value, attackerName);
      lines.push(`${attackerName} plays ${card.name} — ${dealt} damage.`);
      break;
    }
    case 'heal': {
      const healed = healCombatant(attacker, card.value);
      lines.push(`${attackerName} plays ${card.name} — restores ${healed} life.`);
      break;
    }
    case 'draw': {
      drawCards(state, attacker, card.value);
      lines.push(`${attackerName} plays ${card.name} — draws ${card.value} cards.`);
      break;
    }
    case 'damage_draw': {
      const dealt = dealDamage(state, defender, card.value, attackerName);
      drawCards(state, attacker, 1);
      lines.push(`${attackerName} plays ${card.name} — ${dealt} damage, draws a card.`);
      break;
    }
    case 'poison': {
      const dealt = dealDamage(state, defender, card.value, attackerName);
      defender.poison = Math.max(defender.poison, 2);
      defender.poisonTurns = Math.max(defender.poisonTurns, card.id === 'thornsnare' ? 3 : 2);
      lines.push(`${attackerName} plays ${card.name} — ${dealt} damage and poison!`);
      break;
    }
    case 'damage_heal': {
      const dealt = dealDamage(state, defender, card.value, attackerName);
      const healed = healCombatant(attacker, card.value);
      lines.push(`${attackerName} plays ${card.name} — ${dealt} damage, restores ${healed} life.`);
      break;
    }
    case 'shield': {
      attacker.shield += card.value;
      lines.push(`${attackerName} plays ${card.name} — gains ${card.value} shield.`);
      break;
    }
    case 'ember': {
      attacker.ember = Math.min(MAX_EMBER, attacker.ember + card.value);
      lines.push(`${attackerName} plays ${card.name} — gains ${card.value} ember.`);
      break;
    }
    default:
      lines.push(`${attackerName} plays ${card.name}.`);
  }
  return lines.join(' ');
}

export function applyPoison(state, who, whoName) {
  if (who.poisonTurns > 0 && who.poison > 0) {
    const dealt = dealDamage(state, who, who.poison, 'Poison');
    addLog(state, `Poison bites ${whoName} for ${dealt}.`);
    who.poisonTurns -= 1;
    if (who.poisonTurns === 0) who.poison = 0;
  }
}

export function checkEnd(state) {
  if (state.foe.life <= 0) {
    state.phase = 'won';
    state.score += 25; // victory bonus
    state.lastPlay = 'The Ash Baron falls. The court is yours!';
    return true;
  }
  if (state.you.life <= 0) {
    state.phase = 'lost';
    state.lastPlay = 'Your ember gutters out. The court keeps its king.';
    return true;
  }
  return false;
}

// Start of the player's turn: poison ticks, ember refills, cards drawn.
export function startPlayerTurn(state) {
  state.round += 1;
  state.playerTurn = true;
  applyPoison(state, state.you, 'you');
  if (checkEnd(state)) return;
  state.you.ember = Math.min(MAX_EMBER, state.you.ember + EMBER_PER_TURN);
  drawCards(state, state.you, 2);
  state.lastPlay = `Round ${state.round} — your move. ${EMBER_PER_TURN} ember, 2 cards drawn.`;
}

// Start of the Baron's turn: poison ticks, ember refills, one card drawn.
// The Baron runs a leaner economy than the player (2 ember, 1 card) — the
// challenger is meant to win a well-played duel, not a coin flip.
export function startFoeTurn(state) {
  state.playerTurn = false;
  applyPoison(state, state.foe, 'the Ash Baron');
  if (checkEnd(state)) return;
  state.foe.ember = Math.min(MAX_EMBER, state.foe.ember + FOE_EMBER_PER_TURN);
  drawCards(state, state.foe, 1);
}
