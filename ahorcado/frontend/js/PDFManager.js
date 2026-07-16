/**
 * PDFManager.js — Genera un PDF con la tabla de posiciones
 *
 * Usa jsPDF (importado via importmap en index.html o dinámicamente desde CDN).
 * Incluye encabezado estilizado, score actual del jugador y tabla completa.
 */
import { jsPDF as staticJsPDF } from 'jspdf';

export class PDFManager {
  /**
   * Genera y descarga el PDF de la tabla de posiciones.
   *
   * @param {Array}       scores  - Array de objetos { nombre, puntos, tiempo, fecha }
   * @param {Object|null} current - Score actual del jugador (opcional)
   */
  async generate(scores, current = null) {
    // Resolver clase jsPDF de forma robusta
    let jsPDFClass = staticJsPDF;
    if (typeof jsPDFClass !== 'function') {
      try {
        const mod = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm');
        jsPDFClass = mod.jsPDF || mod.default?.jsPDF || mod.default;
      } catch (e) {
        console.warn('[PDFManager] Falló carga jsDelivr, probando esm.sh:', e);
        const mod = await import('https://esm.sh/jspdf@2.5.1');
        jsPDFClass = mod.jsPDF || mod.default?.jsPDF || mod.default;
      }
    }

    if (typeof jsPDFClass !== 'function') {
      throw new Error('No se pudo inicializar la librería jsPDF');
    }

    const doc = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // ── Encabezado ─────────────────────────────────────────────────
    doc.setFillColor(8, 12, 24);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(79, 142, 247);
    doc.text('El Ahorcado', 105, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text('Tabla de Posiciones', 105, 28, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 105, 37, { align: 'center' });

    let y = 54;

    // ── Score actual del jugador ────────────────────────────────────
    if (current) {
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(15, y - 6, 180, 17, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('Tu score:',            22,  y + 4);
      doc.text(String(current.nombre || 'Jugador'), 65,  y + 4);
      doc.text(`${current.puntos} pts`, 125, y + 4);
      doc.text(this.#fmtTime(current.tiempo || 0), 165, y + 4);
      y += 26;
    }

    // ── Cabecera de la tabla ────────────────────────────────────────
    doc.setFillColor(22, 27, 43);
    doc.rect(15, y - 6, 180, 13, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text('#',       22,  y + 3);
    doc.text('Jugador', 42,  y + 3);
    doc.text('Puntos',  118, y + 3);
    doc.text('Tiempo',  148, y + 3);
    doc.text('Fecha',   170, y + 3);
    y += 14;

    // ── Filas ────────────────────────────────────────────────────────
    scores.forEach((s, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(246, 248, 252);
        doc.rect(15, y - 5, 180, 11, 'F');
      }

      if (i === 0) doc.setTextColor(180, 140, 20);
      else if (i === 1) doc.setTextColor(120, 130, 140);
      else if (i === 2) doc.setTextColor(160, 100, 60);
      else doc.setTextColor(30, 41, 59);

      doc.setFont('helvetica', i < 3 ? 'bold' : 'normal');
      doc.setFontSize(9);

      const rank = i < 3 ? ['1o', '2o', '3o'][i] : `${i + 1}.`;
      doc.text(rank,                            22,  y + 2);
      doc.text(String(s.nombre || '').substring(0, 25), 42,  y + 2);
      doc.text(`${s.puntos || 0}`,              118, y + 2);
      doc.text(this.#fmtTime(s.tiempo || 0),    148, y + 2);
      doc.text(this.#fmtDate(s.fecha || new Date()), 170, y + 2);

      y += 12;

      if (y > 265) {
        doc.addPage();
        y = 20;
      }
    });

    // ── Pie de página ─────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('El Ahorcado — Proyecto Programación Web', 105, 287, { align: 'center' });

    doc.save('ahorcado-scores.pdf');
  }

  /** @private Formato MM:SS */
  #fmtTime(sec) {
    const s = Number(sec) || 0;
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  /** @private Formato dd/mm/yyyy */
  #fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('es-AR');
    } catch {
      return 'Fecha desc.';
    }
  }
}
