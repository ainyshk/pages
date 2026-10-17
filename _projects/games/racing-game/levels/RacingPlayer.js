import EnginePlayer from '@assets/js/GameEnginev1.1/essentials/Player.js';

const ARROW_KEYS = new Set([37, 38, 39, 40]);

// Keep the class name Player: the racing HUD uses it to find both cars.
export default class Player extends EnginePlayer {
  handleKeyDown(event) {
    const target = event.target;
    const editing = target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
    const control = this.gameEnv?.gameControl;
    if (editing || event.altKey || event.ctrlKey || event.metaKey || !control || control.isPaused) return;
    if (this.gameEnv.container?.isConnected === false) return;

    // Cancel only movement arrows assigned to this car, while its game is active.
    if (ARROW_KEYS.has(event.keyCode) && Object.values(this.keypress).includes(event.keyCode)) {
      event.preventDefault();
    }
    super.handleKeyDown(event);
  }
}
