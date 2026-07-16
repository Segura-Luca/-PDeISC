/**
 * ScoreManager.js — Comunicación con la API REST del backend
 *
 * Usa fetch (nativo) para:
 *  - GET  /api/scores  → obtener top 10
 *  - POST /api/scores  → guardar nuevo score
 */
export class ScoreManager {
  #apiUrl;

  /** Array de scores cargados (cache local) */
  scores = [];

  /**
   * @param {string} apiUrl - URL base de la API de scores
   */
  constructor(apiUrl = 'http://localhost:3001/api/scores') {
    this.#apiUrl = apiUrl;
  }

  // ── Fetch ────────────────────────────────────────────────────────

  /**
   * Obtiene el top 10 de scores desde el backend.
   * @returns {Promise<Array>}
   * @throws {Error} Si la petición falla
   */
  async fetchScores() {
    const res  = await fetch(this.#apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json  = await res.json();
    this.scores = json.data ?? [];
    return this.scores;
  }

  /**
   * Guarda un score en el backend.
   * @param {string} nombre
   * @param {number} puntos
   * @param {number} tiempo - en segundos
   * @returns {Promise<Object>} El registro insertado
   * @throws {Error} Si la petición falla
   */
  async saveScore(nombre, puntos, tiempo) {
    const res = await fetch(this.#apiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nombre, puntos, tiempo }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  // ── Helpers de formato ────────────────────────────────────────────

  /**
   * Convierte segundos en formato MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Formatea una fecha ISO a dd/mm/yyyy (locale es-AR)
   * @param {string} iso
   * @returns {string}
   */
  formatDate(iso) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });
  }
}
