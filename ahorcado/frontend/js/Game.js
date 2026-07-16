/**
 * Game.js — Clase principal de lógica del juego El Ahorcado
 *
 * Responsabilidades:
 *  - Gestionar el estado de la partida (idle | playing | won | lost)
 *  - Procesar adivinanzas y acumular errores
 *  - Calcular el puntaje final
 *  - Exponer la palabra enmascarada para el render
 */
export class Game {
  /** Número máximo de errores permitidos antes de perder */
  static MAX_ERRORS = 6;

  constructor() {
    this.reset();
  }

  // ──────────────────────────────────────────────────────────────
  // Estado
  // ──────────────────────────────────────────────────────────────

  /** Reinicia el estado a valores por defecto */
  reset() {
    this.word           = '';
    this.guessedLetters = new Set();
    this.errors         = 0;
    this.status         = 'idle';   // 'idle' | 'playing' | 'won' | 'lost'
    this.startTime      = null;
    this.endTime        = null;
    this.points         = 0;
  }

  /**
   * Inicia una nueva partida con la palabra dada
   * @param {string} word - Palabra en mayúsculas (sin espacios extremos)
   */
  start(word) {
    this.reset();
    this.word      = word.toUpperCase().trim();
    this.status    = 'playing';
    this.startTime = Date.now();
  }

  // ──────────────────────────────────────────────────────────────
  // Lógica de juego
  // ──────────────────────────────────────────────────────────────

  /**
   * Procesa una letra adivinada por el jugador.
   * Soporta comparación sin acentos (Ñ y Ü se comparan de forma exacta).
   *
   * @param {string} letter - Letra (se convierte a mayúsculas internamente)
   * @returns {'correct' | 'wrong' | 'already' | null}
   */
  guess(letter) {
    if (this.status !== 'playing') return null;

    const l = letter.toUpperCase();
    if (this.guessedLetters.has(l)) return 'already';

    this.guessedLetters.add(l);

    // Normalizar para comparar ignorando acentos (á=a, é=e, etc.)
    const norm     = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const wordNorm = norm(this.word);
    const lNorm    = norm(l);

    if (wordNorm.includes(lNorm)) {
      this.#checkWin();
      return 'correct';
    } else {
      this.errors++;
      this.#checkLoss();
      return 'wrong';
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Verificaciones internas
  // ──────────────────────────────────────────────────────────────

  /** @private */
  #checkWin() {
    const norm        = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const wordNorm    = norm(this.word);
    const uniqueChars = [...new Set(wordNorm.split(''))].filter(c => c !== ' ');
    const guessedNorm = new Set([...this.guessedLetters].map(norm));
    const allGuessed  = uniqueChars.every(c => guessedNorm.has(c));

    if (allGuessed) {
      this.status  = 'won';
      this.endTime = Date.now();
      this.points  = this.#calculatePoints();
    }
  }

  /** @private */
  #checkLoss() {
    if (this.errors >= Game.MAX_ERRORS) {
      this.status  = 'lost';
      this.endTime = Date.now();
      this.points  = 0;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Cálculo de puntos
  // ──────────────────────────────────────────────────────────────

  /**
   * Fórmula: base(1000) − penalidad_errores(100×err) − penalidad_tiempo(2×seg, máx 400)
   * @private
   */
  #calculatePoints() {
    const time    = this.getTimeElapsed();
    const errPen  = this.errors * 100;
    const timePen = Math.min(time * 2, 400);
    return Math.max(0, 1000 - errPen - timePen);
  }

  // ──────────────────────────────────────────────────────────────
  // Getters / helpers
  // ──────────────────────────────────────────────────────────────

  /** Tiempo transcurrido en segundos desde el inicio */
  getTimeElapsed() {
    if (!this.startTime) return 0;
    return Math.floor(((this.endTime ?? Date.now()) - this.startTime) / 1000);
  }

  /** Intentos restantes */
  getRemainingAttempts() {
    return Game.MAX_ERRORS - this.errors;
  }

  /**
   * Puntaje parcial calculado en tiempo real (útil para el display durante la partida)
   * @returns {number}
   */
  getLiveScore() {
    if (this.status === 'won') return this.points;
    const time    = this.getTimeElapsed();
    const errPen  = this.errors * 100;
    const timePen = Math.min(time * 2, 400);
    return Math.max(0, 1000 - errPen - timePen);
  }

  /**
   * Retorna la palabra como array donde las letras no adivinadas son '_'
   * @returns {string[]}
   */
  getMaskedWord() {
    const norm        = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const guessedNorm = new Set([...this.guessedLetters].map(norm));

    return this.word.split('').map(letter => {
      if (letter === ' ') return ' ';
      return guessedNorm.has(norm(letter)) ? letter : '_';
    });
  }
}
