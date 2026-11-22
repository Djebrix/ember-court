// EMBER COURT — DOM rendering: draws the table, both hands, life bars and log
// from the state, and builds the card elements the player clicks.

import { SUITS } from './cards.js';
import { MAX_LIFE } from './game.js';

const $ = (id) => document.getElementById(id);

export function showScreen(name) {
  for (const id of ['title-screen', 'table-screen', 'end-screen']) {
    $(id).classList.toggle('hidden', id !== name);
  }
}

export function renderCardElement(card, index, onPlay, enabled) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card ${card.suit}`;
  el.dataset.uid = card.uid;
  el.innerHTML =
    `<span class="cost">${card.cost}</span>` +
    `<span class="glyph">${suit.glyph}</span>` +
    `<span class="value">${card.value}</span>` +
    `<span class="name">${card.name}</span>` +
    `<span class="effect">${card.effect}</span>` +
    `<span class="key-hint">${index + 1}</span>`;
  if (enabled) el.classList.add('playable');
  else el.classList.add('unaffordable');
  el.addEventListener('click', () => onPlay(card, el));
  return el;
}

export function renderTable(state, onPlayCard) {
  $('round-number').textContent = String(state.round);
  $('score-total').textContent = String(state.score);
  $('deck-count').textContent = String(state.deck.length);
  $('turn-label').textContent = state.playerTurn ? 'YOURS' : 'BARON';
  $('end-turn-button').disabled = !state.playerTurn || state.busy;

  // Opponent: life, shield, ember, face-down hand.
  $('foe-life-fill').style.width = `${(state.foe.life / MAX_LIFE) * 100}%`;
  $('foe-life-text').textContent = `${state.foe.life} ❤`;
  $('foe-shield').textContent = String(state.foe.shield);
  $('foe-ember').textContent = String(state.foe.ember);
  const foeHand = $('foe-hand');
  foeHand.innerHTML = '';
  for (let i = 0; i < state.foe.hand.length; i++) {
    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '✦';
    foeHand.appendChild(back);
  }

  // Player: life, shield, ember, hand count.
  $('you-life-fill').style.width = `${(state.you.life / MAX_LIFE) * 100}%`;
  $('you-life-text').textContent = `${state.you.life} ❤`;
  $('you-shield').textContent = String(state.you.shield);
  $('you-ember').textContent = String(state.you.ember);
  $('hand-count').textContent = String(state.you.hand.length);

  // Player hand.
  const hand = $('player-hand');
  hand.innerHTML = '';
  state.you.hand.forEach((card, index) => {
    const canPlay = state.playerTurn && !state.busy && card.cost <= state.you.ember;
    hand.appendChild(renderCardElement(card, index, onPlayCard, canPlay));
  });

  // Middle of the table.
  $('last-play').textContent = state.lastPlay;
  const poisonBits = [];
  if (state.you.poisonTurns > 0) poisonBits.push(`You are poisoned: ${state.you.poison}/turn for ${state.you.poisonTurns} more.`);
  if (state.foe.poisonTurns > 0) poisonBits.push(`The Baron is poisoned: ${state.foe.poison}/turn for ${state.foe.poisonTurns} more.`);
  $('poison-line').textContent = poisonBits.join(' ');
  const log = $('log');
  log.innerHTML = '';
  for (const line of state.log) {
    const div = document.createElement('div');
    div.textContent = line;
    log.appendChild(div);
  }
}

export function renderEnd(state) {
  const endScreen = $('end-screen');
  endScreen.classList.remove('win', 'loss');
  if (state.phase === 'won') {
    endScreen.classList.add('win');
    $('end-emblem').textContent = '✦';
    $('end-title').textContent = 'THE COURT IS YOURS';
    $('end-subtitle').textContent = 'The Ash Baron kneels. The ember throne is yours.';
  } else {
    endScreen.classList.add('loss');
    $('end-emblem').textContent = '♛';
    $('end-title').textContent = 'THE ASHES CLAIM YOU';
    $('end-subtitle').textContent = 'Your ember gutters out. The court keeps its king — for now.';
  }
  $('end-score').textContent = String(state.score);
  $('end-rounds').textContent = String(state.round);
  $('end-damage').textContent = String(state.damageDealt);
}

export function shakeElement(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}
