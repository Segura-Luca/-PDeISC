/**
 * main.js — Punto de entrada de la aplicación El Ahorcado
 *
 * Importa UIManager y lo inicializa cuando el DOM está listo.
 * Todos los demás módulos son importados transitivamente desde UIManager.
 */
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIManager();
  ui.init();
});
