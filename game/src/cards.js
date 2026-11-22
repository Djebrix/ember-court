// EMBER COURT — card definitions and deck building.
// Four courts, each with its own colour, glyph and job:
//   ✦ Flame (red) strikes, ≋ Tide (blue) heals and draws,
//   ❋ Thorn (green) poisons and leeches, ⬢ Stone (grey) raises shields.
// A card's `kind` names the effect `game.js` applies; `value` is its headline number.

export const SUITS = {
  flame: { glyph: '✦', label: 'Flame' },
  tide: { glyph: '≋', label: 'Tide' },
  thorn: { glyph: '❋', label: 'Thorn' },
  stone: { glyph: '⬢', label: 'Stone' },
};

// id, name, suit, cost in ember, headline value, effect text, effect kind.
export const CARD_DEFS = [
  { id: 'strike',   name: 'STRIKE',   suit: 'flame', cost: 1, value: 3, effect: 'Deal 3 damage.', kind: 'damage' },
  { id: 'inferno',  name: 'INFERNO',  suit: 'flame', cost: 3, value: 7, effect: 'Deal 7 damage.', kind: 'damage' },
  { id: 'emberlash', name: 'EMBERLASH', suit: 'flame', cost: 2, value: 5, effect: 'Deal 5 damage.', kind: 'damage' },
  { id: 'mend',     name: 'MEND',     suit: 'tide',  cost: 2, value: 4, effect: 'Restore 4 life.', kind: 'heal' },
  { id: 'surge',    name: 'SURGE',    suit: 'tide',  cost: 1, value: 2, effect: 'Draw 2 cards.', kind: 'draw' },
  { id: 'undertow', name: 'UNDERTOW', suit: 'tide',  cost: 2, value: 4, effect: 'Deal 4 damage, draw 1 card.', kind: 'damage_draw' },
  { id: 'bramble',  name: 'BRAMBLE',  suit: 'thorn', cost: 2, value: 2, effect: 'Deal 2 damage. Poison 2 for 2 turns.', kind: 'poison' },
  { id: 'leech',    name: 'LEECH',    suit: 'thorn', cost: 2, value: 3, effect: 'Deal 3 damage, restore 3 life.', kind: 'damage_heal' },
  { id: 'thornsnare', name: 'THORNSNARE', suit: 'thorn', cost: 1, value: 2, effect: 'Deal 2 damage. Poison 1 for 3 turns.', kind: 'poison' },
  { id: 'bulwark',  name: 'BULWARK',  suit: 'stone', cost: 1, value: 4, effect: 'Gain 4 shield.', kind: 'shield' },
  { id: 'rampart',  name: 'RAMPART',  suit: 'stone', cost: 2, value: 8, effect: 'Gain 8 shield.', kind: 'shield' },
  { id: 'tithe',    name: 'TITHE',    suit: 'stone', cost: 0, value: 2, effect: 'Gain 2 ember.', kind: 'ember' },
];

// How many copies of each card go into a 24-card deck.
const DECK_COUNTS = {
  strike: 4, inferno: 2, emberlash: 2,
  mend: 2, surge: 2, undertow: 2,
  bramble: 2, leech: 2, thornsnare: 2,
  bulwark: 2, rampart: 1, tithe: 1,
};

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

export function buildDeck() {
  const deck = [];
  for (const def of CARD_DEFS) {
    const copies = DECK_COUNTS[def.id] ?? 1;
    for (let i = 0; i < copies; i++) deck.push({ ...def, uid: `${def.id}-${i}` });
  }
  return deck;
}

export function shuffleDeck(deck, random) {
  const shuffled = deck.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
