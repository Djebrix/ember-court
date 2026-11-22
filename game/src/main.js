// EMBER COURT — boot and input: wires the buttons, the keys and the mouse to
// the state machine, runs the Baron's turn, and hands the table to render.js.

import {
  newGameState, playCardEffect, checkEnd, startPlayerTurn, startFoeTurn, addLog,
} from './game.js';
import { runFoeTurn } from './ai.js';
import { showScreen, renderTable, renderEnd, shakeElement } from './render.js';
import { applyShotPreset } from './shots.js';

let state = newGameState(Math.random);

function refresh() {
  if (state.phase === 'playing') {
    showScreen('table-screen');
    renderTable(state, onPlayCard);
  } else if (state.phase === 'won' || state.phase === 'lost') {
    renderEnd(state);
    showScreen('end-screen');
  } else {
    showScreen('title-screen');
  }
}

function startDuel() {
  state = newGameState(Math.random);
  state.phase = 'playing';
  state.lastPlay = 'Round 1 — your move. 3 ember, 5 cards in hand.';
  addLog(state, 'The Ash Baron draws his hand. The duel begins.');
  refresh();
}

function onPlayCard(card, element) {
  if (state.phase !== 'playing' || !state.playerTurn || state.busy) return;
  if (card.cost > state.you.ember) {
    shakeElement(element);
    return;
  }
  state.busy = true;
  element.classList.add('flying');
  window.setTimeout(() => {
    state.you.hand = state.you.hand.filter((c) => c.uid !== card.uid);
    state.you.ember -= card.cost;
    const line = playCardEffect(state, card, state.you, state.foe, 'You');
    state.discard.push(card);
    state.lastPlay = line;
    addLog(state, line);
    state.busy = false;
    if (checkEnd(state)) { refresh(); return; }
    refresh();
  }, 420);
}

function endTurn() {
  if (state.phase !== 'playing' || !state.playerTurn || state.busy) return;
  state.busy = true;
  startFoeTurn(state);
  addLog(state, 'The Ash Baron takes his turn.');
  refresh();
  runFoeTurn(
    state,
    playCardEffect,
    (line) => {
      state.lastPlay = line;
      addLog(state, line);
      if (checkEnd(state)) {
        state.busy = false;
        refresh();
        return;
      }
      refresh();
    },
    () => {
      if (state.phase !== 'playing') { state.busy = false; refresh(); return; }
      state.busy = false;
      startPlayerTurn(state);
      refresh();
    },
  );
}

document.getElementById('start-button').addEventListener('click', startDuel);
document.getElementById('play-again-button').addEventListener('click', startDuel);
document.getElementById('restart-button').addEventListener('click', startDuel);
document.getElementById('end-turn-button').addEventListener('click', endTurn);

document.addEventListener('keydown', (event) => {
  if (state.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    startDuel();
    return;
  }
  if (state.phase === 'won' || state.phase === 'lost') {
    if (event.key === 'r' || event.key === 'R' || event.key === 'Enter') startDuel();
    return;
  }
  if (state.phase !== 'playing') return;
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    endTurn();
    return;
  }
  if (event.key === 'r' || event.key === 'R') { startDuel(); return; }
  const slot = Number.parseInt(event.key, 10);
  if (slot >= 1 && slot <= state.you.hand.length) {
    const card = state.you.hand[slot - 1];
    const element = document.querySelector(`.card[data-uid="${card.uid}"]`);
    onPlayCard(card, element);
  }
});

// Screenshot hook: ?shot=title|play|win|loss&seed=N renders a fixed scene
// of the real game for the maker's screenshots. See shots.js.
const params = new URLSearchParams(window.location.search);
if (params.has('shot')) {
  state = applyShotPreset(params.get('shot'), Number(params.get('seed') || 7));
  refresh();
} else {
  refresh();
}
