/**
 * WordAPI.js — Obtiene palabras aleatorias en español
 *
 * Estrategia:
 *  1. Intenta la API pública random-word-api.vercel.app (timeout 3s)
 *  2. Si falla, elige una palabra del array local FALLBACK_WORDS
 */
export class WordAPI {
  // API pública de palabras en español con más de 108,000 palabras
  static #API_URL = 'https://random-word-api.herokuapp.com/word?lang=es&number=15';

  /** Array de respaldo: palabras comunes en español */
  static FALLBACK_WORDS = [
    'MARIPOSA', 'ELEFANTE', 'PROGRAMAR', 'GIRASOL', 'BIBLIOTECA',
    'DINOSAURIO', 'CHOCOLATE', 'AVENTURA', 'PINGUINO', 'TORTUGA',
    'SERPIENTE', 'LABERINTO', 'MISTERIO', 'PRINCESA', 'GALAXIA',
    'PLANETA', 'ESTRELLA', 'CASTILLO', 'PIRATA', 'TESORO',
    'MUSICA', 'TEATRO', 'PELICULA', 'FUTBOL', 'CIENCIA',
    'HISTORIA', 'COHETE', 'ROBOT', 'OCEANO', 'BOSQUE',
    'DESIERTO', 'JARDIN', 'DRAGON', 'CIUDAD', 'MONTANA',
    'VOLCAN', 'TORNADO', 'BALLENA', 'CAMELLO', 'LEOPARDO',
    'AGUILA', 'COCODRILO', 'CANGREJO', 'PULPO', 'TIBURON',
    'UNIVERSO', 'SATELITE', 'ASTEROIDE', 'COMETA', 'PIRAMIDE',
    'ESPADA', 'ESCUDO', 'PALETA', 'PINTURA', 'ESCULTURA',
    'QUIMICA', 'BIOLOGIA', 'GEOGRAFIA', 'FILOSOFIA', 'ECONOMIA',
    'TELEFONO', 'ORDENADOR', 'INTERNET', 'TECLADO', 'PANTALLA',
    'RELAMPAGO', 'ARCOIRIS', 'MEDUSA', 'HORMIGA', 'CACTUS',
    'MURCIELAGO', 'ALCATRAZ', 'ESPERANZA', 'ARQUITECTO', 'MANDARINA',
    'HURACAN', 'ARMADURA', 'ALMIBAR', 'HECHICERO', 'ESMERALDA',
    'MERCURIO', 'JUPITER', 'NEPTUNO', 'ANTARTIDA', 'AMAZONAS',
    'CABALLERO', 'FORTALEZA', 'BRUJULA', 'CATARATA', 'PERGAMINO'
  ];

  /**
   * Obtiene una palabra aleatoria en español.
   * @returns {Promise<{ word: string, fromAPI: boolean }>}
   */
  static async getRandomWord() {
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(WordAPI.#API_URL, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error('Respuesta vacía');

      // Buscar en el lote devuelto una palabra que sea una sola palabra (sin espacios ni guiones) entre 4 y 12 letras
      const validWord = data.find(w => /^[a-záéíóúüñ]{4,12}$/i.test(w.trim()));
      if (!validWord) throw new Error('Ninguna palabra válida en el lote devuelto');

      const word = validWord.toUpperCase().trim();
      return { word, fromAPI: true };
    } catch (err) {
      console.warn('[WordAPI] Usando fallback local:', err.message);
      const list = WordAPI.FALLBACK_WORDS;
      const word = list[Math.floor(Math.random() * list.length)];
      return { word, fromAPI: false };
    }
  }
}
