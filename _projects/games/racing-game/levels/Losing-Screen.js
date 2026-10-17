const RESTART_DELAY_MS = 10_000;

export default class LosingScreen {
  constructor({ container, gameControl, loserName }) {
    if (!container || !gameControl) {
      throw new TypeError('LosingScreen needs the game container and gameControl');
    }


    this.gameControl = gameControl;
    this.deadline = Date.now() + RESTART_DELAY_MS;
    this.element = this.createElement(loserName);
    container.appendChild(this.element);

    this.gameControl.pause();
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 250);
    this.restartTimeout = setTimeout(() => this.restart(), RESTART_DELAY_MS);
  }

  createElement(loserName) {
    const element = document.createElement('div');
    element.className = 'racing-losing-screen';
    element.setAttribute('role', 'alert');
    Object.assign(element.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '40',
      display: 'grid',
      alignContent: 'center',
      justifyItems: 'center',
      padding: '24px',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    });

    const title = document.createElement('h2');
    title.className = 'racing-losing-screen__title';
    title.textContent = 'Race over';
    Object.assign(title.style, {
      margin: '0 0 16px',
      color: '#facc15',
      fontSize: 'clamp(24px, 5vw, 40px)'
    });

    const message = document.createElement('p');
    message.className = 'racing-losing-screen__message';
    message.textContent = `${loserName || 'Car'} lost`;
    Object.assign(message.style, {
      margin: '0 0 12px',
      color: '#f87171',
      fontSize: 'clamp(20px, 4vw, 32px)',
      fontWeight: 'bold'
    });

    this.countdown = document.createElement('p');
    this.countdown.className = 'racing-losing-screen__countdown';
    Object.assign(this.countdown.style, { margin: '0', fontSize: '16px' });

    element.append(title, message, this.countdown);
    return element;
  }

  updateCountdown() {
    const secondsRemaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
    this.countdown.textContent = `Restarting in ${secondsRemaining} second${secondsRemaining === 1 ? '' : 's'}...`;
  }

  restart() {
    this.destroy();
    this.gameControl.resume();
    this.gameControl.transitionToLevel();
  }

  destroy() {
    clearInterval(this.countdownInterval);
    clearTimeout(this.restartTimeout);
    this.element.remove();
  }
}
