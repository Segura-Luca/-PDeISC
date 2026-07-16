/**
 * SoundManager.js — Efectos de sonido sintéticos via Web Audio API
 *
 * No requiere archivos de audio externos.
 * Todos los sonidos se generan con osciladores en tiempo real.
 */
export class SoundManager {
  #ctx     = null;
  #enabled = true;

  constructor() {
    try {
      this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      console.warn('[SoundManager] Web Audio API no disponible');
    }
  }

  /** Reactiva el contexto si el navegador lo suspendió */
  #resume() {
    if (this.#ctx?.state === 'suspended') this.#ctx.resume();
  }

  /**
   * Reproduce un tono individual
   * @param {number} freq     - Frecuencia en Hz
   * @param {string} type     - Tipo de onda: 'sine'|'square'|'sawtooth'|'triangle'
   * @param {number} duration - Duración en segundos
   * @param {number} volume   - Volumen 0-1
   * @param {number} delay    - Retraso antes de reproducir (segundos)
   */
  #tone(freq, type, duration, volume = 0.25, delay = 0) {
    if (!this.#enabled || !this.#ctx) return;
    this.#resume();

    const osc  = this.#ctx.createOscillator();
    const gain = this.#ctx.createGain();
    osc.connect(gain);
    gain.connect(this.#ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.#ctx.currentTime + delay);

    const t0 = this.#ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  // ── Efectos ─────────────────────────────────────────────────────

  /** Letra correcta — dos notas ascendentes */
  playCorrect() {
    this.#tone(523, 'sine', 0.15, 0.3, 0);
    this.#tone(659, 'sine', 0.15, 0.3, 0.12);
  }

  /** Letra incorrecta — buzzer corto y grave */
  playWrong() {
    this.#tone(160, 'sawtooth', 0.28, 0.2, 0);
  }

  /** Victoria — fanfarria ascendente */
  playWin() {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.#tone(f, 'sine', 0.22, 0.4, i * 0.12);
    });
  }

  /** Derrota — descenso triste */
  playLose() {
    [400, 340, 280, 210].forEach((f, i) => {
      this.#tone(f, 'triangle', 0.3, 0.28, i * 0.18);
    });
  }

  /** Click de interfaz — muy corto */
  playClick() {
    this.#tone(900, 'square', 0.04, 0.08);
  }

  // ── Control ─────────────────────────────────────────────────────

  /** Alterna el estado habilitado/deshabilitado */
  toggle() {
    this.#enabled = !this.#enabled;
    return this.#enabled;
  }

  get enabled() { return this.#enabled; }
}
