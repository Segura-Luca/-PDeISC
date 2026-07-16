/**
 * UIManager.js — Coordinador central de la interfaz y el juego
 */
import { Game }         from './Game.js';
import { WordAPI }      from './WordAPI.js';
import { HangmanSVG }  from './HangmanSVG.js';
import { SoundManager } from './SoundManager.js';
import { ScoreManager } from './ScoreManager.js';

export class UIManager {
  // ── Instancias de módulos ────────────────────────────────────────
  #game         = new Game();
  #sound        = new SoundManager();
  #scoreManager = new ScoreManager();
  #hangman      = null;

  // ── Estado interno ────────────────────────────────────────────────
  #timerInterval = null;
  #savedScore    = null;
  #allScores     = [];

  // ── Referencias al DOM ────────────────────────────────────────────
  #el = {};

  // ── Modales Bootstrap (inicializados después del DOM) ─────────────
  #modalWin   = null;
  #modalLose  = null;
  #modalSave  = null;
  #modalRules = null;

  // ════════════════════════════════════════════════════════════════
  // Inicialización
  // ════════════════════════════════════════════════════════════════

  init() {
    this.#cacheDOM();
    this.#initModals();
    this.#hangman = new HangmanSVG(this.#el.hangmanSvg);
    this.#setupKeyboard();
    this.#loadTheme();
    this.#bindEvents();
    this.#loadScores();
    this.newGame();
  }

  // ── Cache DOM ─────────────────────────────────────────────────────

  #cacheDOM() {
    const q = id => document.getElementById(id);

    this.#el = {
      hangmanSvg:         q('hangman-svg'),
      wordDisplay:        q('word-display'),
      livesDisplay:       q('lives-display'),
      timerDisplay:       q('timer-display'),
      scoreDisplay:       q('score-display'),
      apiStatus:          q('api-status'),
      keyboard:           q('keyboard'),
      btnNewGame:         q('btn-new-game'),
      btnSaveScore:       q('btn-save-score'),
      btnDownloadPDF:     q('btn-download-pdf'),
      btnTheme:           q('btn-theme'),
      btnSound:           q('btn-sound'),
      leaderboardBody:    q('leaderboard-body'),
      leaderboardEmpty:   q('leaderboard-empty'),
      leaderboardLoading: q('leaderboard-loading'),
      winPoints:          q('win-points'),
      winTime:            q('win-time'),
      winErrors:          q('win-errors'),
      loseWord:           q('lose-word'),
      saveNameInput:      q('save-name'),
      btnSaveConfirm:     q('btn-save-confirm'),
      toastContainer:     q('toast-container'),
    };
  }

  // ── Inicializar modales Bootstrap ──────────────────────────────────
  // Bootstrap 5 necesita el ELEMENTO DOM, no un string selector

  #initModals() {
    const getModal = id => {
      const el = document.getElementById(id);
      if (!el) { console.warn(`[UIManager] Modal no encontrado: #${id}`); return null; }
      return new bootstrap.Modal(el);
    };

    this.#modalWin   = getModal('modal-win');
    this.#modalLose  = getModal('modal-lose');
    this.#modalSave  = getModal('modal-save');
    this.#modalRules = getModal('modal-rules');
  }

  // ════════════════════════════════════════════════════════════════
  // Teclado virtual + físico
  // ════════════════════════════════════════════════════════════════

  #setupKeyboard() {
    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L','Ñ'],
      ['Z','X','C','V','B','N','M'],
    ];

    this.#el.keyboard.innerHTML = '';

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      row.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = letter;
        btn.id = `key-${letter}`;
        btn.setAttribute('aria-label', `Letra ${letter}`);
        btn.addEventListener('click', () => this.#handleKey(letter));
        rowDiv.appendChild(btn);
      });

      this.#el.keyboard.appendChild(rowDiv);
    });

    // Teclado físico
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      let letter = e.key.toUpperCase();
      const accentMap = { 'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ü':'U' };
      if (accentMap[letter]) letter = accentMap[letter];
      if (/^[A-ZÑ]$/.test(letter)) this.#handleKey(letter);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // Eventos
  // ════════════════════════════════════════════════════════════════

  #bindEvents() {
    // Tema
    this.#el.btnTheme?.addEventListener('click', () => {
      this.#sound.playClick();
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.#applyTheme(isDark ? 'light' : 'dark');
    });

    // Sonido
    this.#el.btnSound?.addEventListener('click', () => {
      const on = this.#sound.toggle();
      const icon = this.#el.btnSound.querySelector('i');
      if (icon) icon.className = on ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill';
      this.#el.btnSound.title = on ? 'Silenciar' : 'Activar sonido';
    });

    // Nueva partida
    this.#el.btnNewGame?.addEventListener('click', () => {
      this.#sound.playClick();
      this.newGame();
    });

    // Guardar score
    this.#el.btnSaveScore?.addEventListener('click', () => {
      this.#el.saveNameInput.value = '';
      this.#modalSave?.show();
      setTimeout(() => this.#el.saveNameInput?.focus(), 300);
    });

    // Confirmar guardado
    this.#el.btnSaveConfirm?.addEventListener('click', () => this.#doSave());
    this.#el.saveNameInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#doSave();
    });

    // PDF
    this.#el.btnDownloadPDF?.addEventListener('click', () => this.#downloadPDF());

    // Reglas
    document.getElementById('btn-rules')?.addEventListener('click', () => {
      this.#modalRules?.show();
    });

    // Modal Victoria — botones internos
    document.getElementById('btn-win-save')?.addEventListener('click', () => {
      this.#modalWin?.hide();
      this.#el.saveNameInput.value = '';
      setTimeout(() => this.#modalSave?.show(), 250);
    });

    document.getElementById('btn-win-new-game')?.addEventListener('click', () => {
      this.#modalWin?.hide();
      this.newGame();
    });

    // Modal Derrota
    document.getElementById('btn-lose-new-game')?.addEventListener('click', () => {
      this.#modalLose?.hide();
      this.newGame();
    });

    // Refrescar tabla
    document.getElementById('btn-refresh-scores')?.addEventListener('click', () => {
      this.#sound.playClick();
      this.#loadScores();
    });
  }

  // ════════════════════════════════════════════════════════════════
  // Tema
  // ════════════════════════════════════════════════════════════════

  #loadTheme() {
    const saved = localStorage.getItem('ahorcado-theme') || 'dark';
    this.#applyTheme(saved);
  }

  #applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = this.#el.btnTheme?.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    if (this.#el.btnTheme) {
      this.#el.btnTheme.title = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }
    localStorage.setItem('ahorcado-theme', theme);
  }

  // ════════════════════════════════════════════════════════════════
  // Juego
  // ════════════════════════════════════════════════════════════════

  async newGame() {
    this.#stopTimer();
    if (this.#el.btnSaveScore) this.#el.btnSaveScore.disabled = true;
    this.#savedScore = null;

    // Resetear teclado
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.classList.remove('correct', 'wrong');
      btn.disabled = false;
    });

    // Spinner mientras carga
    if (this.#el.wordDisplay) {
      this.#el.wordDisplay.innerHTML = `
        <div class="d-flex flex-column align-items-center gap-3 py-3">
          <div class="spinner-border text-primary" style="width:2.5rem;height:2.5rem;" role="status">
            <span class="visually-hidden">Cargando…</span>
          </div>
          <span class="text-muted small">Obteniendo palabra…</span>
        </div>`;
    }
    if (this.#el.apiStatus) this.#el.apiStatus.innerHTML = '';

    const { word, fromAPI } = await WordAPI.getRandomWord();

    if (this.#el.apiStatus) {
      this.#el.apiStatus.innerHTML = fromAPI
        ? '<span class="badge bg-success rounded-pill"><i class="bi bi-wifi me-1"></i>API</span>'
        : '<span class="badge bg-warning text-dark rounded-pill"><i class="bi bi-hdd me-1"></i>Local</span>';
    }

    this.#game.start(word);
    this.#hangman?.reset();

    this.#updateWordDisplay();
    this.#updateLives();
    this.#updateScore();
    this.#startTimer();
  }

  // ── Manejo de tecla ───────────────────────────────────────────────

  #handleKey(letter) {
    if (this.#game.status !== 'playing') return;

    const result = this.#game.guess(letter);
    if (result === 'already') return;

    const btn = document.getElementById(`key-${letter}`);

    if (result === 'correct') {
      this.#sound.playCorrect();
      btn?.classList.add('correct');
      if (btn) btn.disabled = true;
      this.#updateWordDisplay();
      this.#updateScore();
      if (this.#game.status === 'won') this.#onWin();
    } else {
      this.#sound.playWrong();
      btn?.classList.add('wrong');
      if (btn) btn.disabled = true;
      this.#hangman?.update(this.#game.errors);
      this.#hangman?.shake();
      this.#updateLives();
      this.#updateScore();
      if (this.#game.status === 'lost') this.#onLose();
    }
  }

  // ── Victoria ──────────────────────────────────────────────────────

  #onWin() {
    this.#stopTimer();
    this.#sound.playWin();
    this.#hangman?.celebrate();
    if (this.#el.btnSaveScore) this.#el.btnSaveScore.disabled = false;

    if (this.#el.winPoints) this.#el.winPoints.textContent = this.#game.points;
    if (this.#el.winTime)   this.#el.winTime.textContent   = this.#scoreManager.formatTime(this.#game.getTimeElapsed());
    if (this.#el.winErrors) this.#el.winErrors.textContent = this.#game.errors;

    setTimeout(() => this.#modalWin?.show(), 650);
  }

  // ── Derrota ───────────────────────────────────────────────────────

  #onLose() {
    this.#stopTimer();
    this.#sound.playLose();
    if (this.#el.loseWord) this.#el.loseWord.textContent = this.#game.word;
    this.#updateWordDisplay(true);
    setTimeout(() => this.#modalLose?.show(), 650);
  }

  // ════════════════════════════════════════════════════════════════
  // Actualización de UI
  // ════════════════════════════════════════════════════════════════

  #updateWordDisplay(revealAll = false) {
    if (!this.#el.wordDisplay) return;
    const masked = revealAll ? this.#game.word.split('') : this.#game.getMaskedWord();

    this.#el.wordDisplay.innerHTML = masked
      .map((ch, i) => {
        if (ch === ' ') return '<span class="word-space"></span>';
        const isRevealed = ch !== '_';
        return `<span class="word-letter ${isRevealed ? 'revealed' : ''} ${revealAll && isRevealed ? 'reveal-final' : ''}"
                      data-index="${i}" aria-label="${isRevealed ? ch : 'letra oculta'}">${ch}</span>`;
      })
      .join('');
  }

  #updateLives() {
    if (!this.#el.livesDisplay) return;
    const rem   = this.#game.getRemainingAttempts();
    const total = Game.MAX_ERRORS;
    this.#el.livesDisplay.innerHTML = Array.from({ length: total }, (_, i) =>
      `<i class="bi bi-heart${i < rem ? '-fill text-danger' : ' text-muted'} fs-4" aria-hidden="true"></i>`
    ).join('');
  }

  #updateScore() {
    if (this.#el.scoreDisplay) this.#el.scoreDisplay.textContent = this.#game.getLiveScore();
  }

  // ════════════════════════════════════════════════════════════════
  // Timer
  // ════════════════════════════════════════════════════════════════

  #startTimer() {
    if (this.#el.timerDisplay) this.#el.timerDisplay.textContent = '00:00';
    this.#timerInterval = setInterval(() => {
      if (this.#game.status === 'playing') {
        if (this.#el.timerDisplay) {
          this.#el.timerDisplay.textContent = this.#scoreManager.formatTime(this.#game.getTimeElapsed());
        }
        this.#updateScore();
      }
    }, 500);
  }

  #stopTimer() {
    clearInterval(this.#timerInterval);
    this.#timerInterval = null;
  }

  // ════════════════════════════════════════════════════════════════
  // Scores
  // ════════════════════════════════════════════════════════════════

  async #doSave() {
    const nombre = this.#el.saveNameInput?.value.trim();
    if (!nombre) {
      this.#showToast('Por favor ingresá tu nombre 👤', 'warning');
      this.#el.saveNameInput?.focus();
      return;
    }

    const btn = this.#el.btnSaveConfirm;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Guardando…';
    }

    try {
      this.#savedScore = await this.#scoreManager.saveScore(
        nombre,
        this.#game.points,
        this.#game.getTimeElapsed()
      );
      this.#modalSave?.hide();
      if (this.#el.btnSaveScore) this.#el.btnSaveScore.disabled = true;
      this.#showToast('¡Score guardado exitosamente! 🎉', 'success');
      await this.#loadScores();
    } catch (err) {
      console.error('[doSave]', err);
      this.#showToast('No se pudo guardar. ¿Está corriendo el backend en localhost:3001?', 'danger');
    } finally {
      if (btn) {
        btn.disabled  = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar';
      }
    }
  }

  async #loadScores() {
    this.#el.leaderboardLoading?.classList.remove('d-none');
    this.#el.leaderboardEmpty?.classList.add('d-none');
    if (this.#el.leaderboardBody) this.#el.leaderboardBody.innerHTML = '';

    try {
      this.#allScores = await this.#scoreManager.fetchScores();
      this.#renderLeaderboard();
    } catch (err) {
      console.warn('[loadScores]', err);
      this.#showToast('No se pudo cargar la tabla. ¿Está corriendo el backend?', 'warning');
      this.#el.leaderboardEmpty?.classList.remove('d-none');
    } finally {
      this.#el.leaderboardLoading?.classList.add('d-none');
    }
  }

  #renderLeaderboard() {
    if (!this.#el.leaderboardBody) return;
    if (!this.#allScores.length) {
      this.#el.leaderboardEmpty?.classList.remove('d-none');
      return;
    }
    this.#el.leaderboardEmpty?.classList.add('d-none');
    const medals = ['🥇','🥈','🥉'];
    this.#el.leaderboardBody.innerHTML = this.#allScores
      .map((s, i) => `
        <tr class="${i===0?'row-gold':i===1?'row-silver':i===2?'row-bronze':''}">
          <td class="text-center fw-bold medal-cell">${medals[i] ?? `${i+1}.`}</td>
          <td class="fw-500">${this.#escapeHtml(s.nombre)}</td>
          <td class="text-center fw-bold text-accent">${s.puntos}</td>
          <td class="text-center font-mono">${this.#scoreManager.formatTime(s.tiempo)}</td>
          <td class="text-center text-muted small">${this.#scoreManager.formatDate(s.fecha)}</td>
        </tr>`)
      .join('');
  }

  // ════════════════════════════════════════════════════════════════
  // PDF — carga dinámica para no bloquear el arranque
  // ════════════════════════════════════════════════════════════════

  async #downloadPDF() {
    this.#sound.playClick();
    if (!this.#allScores.length) {
      this.#showToast('No hay scores para exportar todavía', 'warning');
      return;
    }
    try {
      this.#showToast('Generando PDF... 📄', 'info');
      const { PDFManager } = await import('./PDFManager.js');
      const pdf = new PDFManager();
      await pdf.generate(this.#allScores, this.#savedScore);
      this.#showToast('¡PDF descargado exitosamente! 📄', 'success');
    } catch (err) {
      console.error('[PDF]', err);
      this.#showToast('Error al generar PDF: ' + (err.message || 'Intente de nuevo'), 'danger');
    }
  }

  // ════════════════════════════════════════════════════════════════
  // Toast
  // ════════════════════════════════════════════════════════════════

  #showToast(message, type = 'info') {
    const colorMap = {
      success: 'bg-success',
      danger:  'bg-danger',
      warning: 'bg-warning text-dark',
      info:    'bg-info text-dark',
    };

    const div = document.createElement('div');
    div.className = `toast align-items-center text-white ${colorMap[type] ?? 'bg-secondary'} border-0`;
    div.setAttribute('role', 'alert');
    div.setAttribute('aria-live', 'assertive');
    div.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="toast-body fw-500">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 ms-auto flex-shrink-0"
                data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>`;

    this.#el.toastContainer?.appendChild(div);
    const toast = new bootstrap.Toast(div, { delay: 4000 });
    toast.show();
    div.addEventListener('hidden.bs.toast', () => div.remove());
  }

  // ════════════════════════════════════════════════════════════════
  // Utilidades
  // ════════════════════════════════════════════════════════════════

  #escapeHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }
}
