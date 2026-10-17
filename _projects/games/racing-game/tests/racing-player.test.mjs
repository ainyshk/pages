import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Isolate the racing keyboard policy from engine rendering and browser setup.
const engineStub = `export default class EnginePlayer {
  constructor(data, gameEnv) { this.keypress = data.keypress; this.gameEnv = gameEnv; this.received = []; }
  handleKeyDown(event) { this.received.push(event.keyCode); }
}`;
const stubUrl = `data:text/javascript;base64,${Buffer.from(engineStub).toString('base64')}`;
const source = (await readFile(new URL('../levels/RacingPlayer.js', import.meta.url), 'utf8'))
  .replace('@assets/js/GameEnginev1.1/essentials/Player.js', stubUrl);
const { default: Player } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const arrows = { up: 38, left: 37, down: 40, right: 39 };
const wasd = { up: 87, left: 65, down: 83, right: 68 };

function fixture(keypress = arrows) {
  const env = { gameControl: { isPaused: false }, container: { isConnected: true } };
  return new Player({ keypress }, env);
}

function press(player, keyCode, options = {}) {
  let prevented = false;
  player.handleKeyDown({ keyCode, preventDefault() { prevented = true; }, ...options });
  return prevented;
}

test('all mapped arrows prevent page scrolling and still reach the movement handler', () => {
  const player = fixture();
  for (const code of Object.values(arrows)) assert.equal(press(player, code), true);
  assert.deepEqual(player.received, Object.values(arrows));
  assert.equal(player.constructor.name, 'Player', 'HUD can still find the car');
});

test('WASD and unmapped arrows keep their browser defaults', () => {
  const player = fixture(wasd);
  assert.equal(press(player, 38), false);
  assert.equal(press(player, 87), false);
  assert.deepEqual(player.received, [38, 87]);
});

test('typing fields and browser shortcuts do not move cars or block default behavior', () => {
  const player = fixture();
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    assert.equal(press(player, 38, { target: { tagName } }), false);
  }
  assert.equal(press(player, 38, { target: { isContentEditable: true } }), false);
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
    assert.equal(press(player, 37, { [modifier]: true }), false);
  }
  assert.deepEqual(player.received, []);
});

test('paused and detached games do not capture keys', () => {
  const player = fixture();
  player.gameEnv.gameControl.isPaused = true;
  assert.equal(press(player, 40), false);
  player.gameEnv.gameControl.isPaused = false;
  player.gameEnv.container.isConnected = false;
  assert.equal(press(player, 40), false);
  assert.deepEqual(player.received, []);
});
