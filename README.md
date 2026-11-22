[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Djebrix/ember-court/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Djebrix/ember-court/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# EMBER COURT

A complete, original card battler for [make.fun's best card game bounty](https://make.fun/bounty/best-card-game-20261122-1826). You duel the Ash Baron for the ember throne, one card at a time.

## How to play

- **Goal:** reduce the Ash Baron's life to 0 before he reduces yours to 0.
- **Each round** you gain 3 ember and draw 2 cards. Cards cost ember to play.
- **Four courts**, told apart by colour and glyph:
  - ✦ **Flame** (red) — strikes: Strike, Emberlash, Inferno deal direct damage.
  - ≋ **Tide** (blue) — Mend heals, Surge draws cards, Undertow does both.
  - ❋ **Thorn** (green) — Bramble and Thornsnare poison; Leech damages and heals you.
  - ⬢ **Stone** (grey) — Bulwark and Rampart raise shields; Tithe grants ember.
- **Shield** absorbs damage before life does. **Poison** bites at the start of the victim's turn.
- **Score** grows with every point of damage you deal, plus 25 for the win.
- **Controls:** click a card to play it (glowing cards are affordable), keys **1–7** play cards, **Space** ends your turn, **R** restarts.

The Baron plays by a readable heuristic — he goes for the kill when he sees it, shields when he is bleeding, heals when he is hurt — so his choices can be read and countered.

## Run it

Static files, no build step, no network:

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

or open `game/index.html` from any static server. Plays in desktop Chrome with keyboard and mouse.

Screenshot scenes (`?shot=title|play|win|loss&seed=N`) render fixed states of the real game for the maker's screenshots.

## Layout

- `game/index.html` — the table, title and end screens
- `game/styles.css` — all art is CSS; no images, fonts or network
- `game/src/cards.js` — the four courts and the 24-card deck
- `game/src/game.js` — turns, ember, damage, shield, poison, score
- `game/src/ai.js` — the Ash Baron's heuristic
- `game/src/render.js` — DOM rendering of the table and hands
- `game/src/shots.js` — fixed screenshot scenes of the real game
- `game/src/main.js` — boot, input, turn flow
- `main.ts` — hands the entry in (copies `game/` and `screenshots/`, writes `dossier.json`)
