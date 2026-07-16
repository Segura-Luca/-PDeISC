/**
 * HangmanSVG.js — Dibuja el muñeco del ahorcado con SVG
 *
 * Los 6 errores revelan progresivamente:
 *  Error 1 → Cabeza
 *  Error 2 → Cuerpo
 *  Error 3 → Brazo izquierdo
 *  Error 4 → Brazo derecho
 *  Error 5 → Pierna izquierda
 *  Error 6 → Pierna derecha
 *
 * La horca siempre es visible.
 */
export class HangmanSVG {
  constructor(svgElement) {
    this.svg   = svgElement;
    this.parts = [];
    this.#build();
  }

  // ────────────────────────────────────────────────────────────────
  // Construcción
  // ────────────────────────────────────────────────────────────────

  /** Crea un elemento SVG con atributos dados */
  #el(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  #build() {
    this.svg.setAttribute('viewBox', '0 0 220 280');
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('aria-label', 'Dibujo del ahorcado');

    // ── Horca (siempre visible) ───────────────────────────────────
    [
      this.#el('line', { x1: 10,  y1: 268, x2: 210, y2: 268 }),  // Base
      this.#el('line', { x1: 60,  y1: 268, x2: 60,  y2: 12  }),  // Poste
      this.#el('line', { x1: 60,  y1: 12,  x2: 152, y2: 12  }),  // Viga horizontal
      this.#el('line', { x1: 152, y1: 12,  x2: 152, y2: 48  }),  // Soga
    ].forEach(el => {
      el.classList.add('gallows-part');
      this.svg.appendChild(el);
    });

    // ── Partes del cuerpo (se revelan con cada error) ─────────────
    this.parts = [
      this.#el('circle', { cx: 152, cy: 70, r: 22 }),              // 1 Cabeza
      this.#el('line',   { x1: 152, y1: 92,  x2: 152, y2: 162 }), // 2 Cuerpo
      this.#el('line',   { x1: 152, y1: 115, x2: 120, y2: 145 }), // 3 Brazo izq
      this.#el('line',   { x1: 152, y1: 115, x2: 184, y2: 145 }), // 4 Brazo der
      this.#el('line',   { x1: 152, y1: 162, x2: 120, y2: 210 }), // 5 Pierna izq
      this.#el('line',   { x1: 152, y1: 162, x2: 184, y2: 210 }), // 6 Pierna der
    ];

    this.parts.forEach(el => {
      el.classList.add('hangman-part');
      this.svg.appendChild(el);
    });
  }

  // ────────────────────────────────────────────────────────────────
  // API pública
  // ────────────────────────────────────────────────────────────────

  /**
   * Muestra las partes del cuerpo correspondientes al número de errores
   * @param {number} errors
   */
  update(errors) {
    this.parts.forEach((part, i) => {
      part.classList.toggle('visible', i < errors);
    });
  }

  /** Oculta todas las partes del cuerpo */
  reset() {
    this.parts.forEach(p => p.classList.remove('visible'));
  }

  /** Animación de sacudida al cometer un error */
  shake() {
    this.svg.classList.add('shake');
    this.svg.addEventListener(
      'animationend',
      () => this.svg.classList.remove('shake'),
      { once: true }
    );
  }

  /** Animación de rebote al ganar */
  celebrate() {
    this.svg.classList.add('celebrate');
    this.svg.addEventListener(
      'animationend',
      () => this.svg.classList.remove('celebrate'),
      { once: true }
    );
  }
}
