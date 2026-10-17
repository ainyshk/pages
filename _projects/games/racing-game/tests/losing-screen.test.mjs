import test from 'node:test';
import assert from 'node:assert/strict';
import LosingScreen from '../levels/Losing-Screen.js';

class TestElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.textContent = '';
    this.className = '';
    this.attributes = {};
    this.style = {};
    this.removed = false;
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  remove() {
    this.removed = true;
  }
}

test('shows the losing car and restarts the paused level after the countdown', (t) => {
  const originalGlobals = {
    document: globalThis.document,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  t.after(() => Object.assign(globalThis, originalGlobals));

  let timeoutCallback;
  let intervalId;
  let timeoutId;
  const clearedIntervals = [];
  const clearedTimeouts = [];
  globalThis.document = { createElement: (tagName) => new TestElement(tagName) };
  globalThis.setInterval = () => (intervalId = Symbol('interval'));
  globalThis.clearInterval = (id) => clearedIntervals.push(id);
  globalThis.setTimeout = (callback) => {
    timeoutCallback = callback;
    return (timeoutId = Symbol('timeout'));
  };
  globalThis.clearTimeout = (id) => clearedTimeouts.push(id);

  const container = new TestElement('container');
  const calls = [];
  const gameControl = {
    pause: () => calls.push('pause'),
    resume: () => calls.push('resume'),
    transitionToLevel: () => calls.push('restart')
  };
  const screen = new LosingScreen({ container, gameControl, loserName: 'Blue Car' });

  assert.equal(container.children[0].children[1].textContent, 'Blue Car lost');
  assert.equal(container.children[0].children[2].textContent, 'Restarting in 10 seconds...');
  assert.deepEqual(calls, ['pause']);

  timeoutCallback();

  assert.deepEqual(calls, ['pause', 'resume', 'restart']);
  assert.deepEqual(clearedIntervals, [intervalId]);
  assert.deepEqual(clearedTimeouts, [timeoutId]);
  assert.equal(container.children[0].removed, true);
  screen.destroy();
});
