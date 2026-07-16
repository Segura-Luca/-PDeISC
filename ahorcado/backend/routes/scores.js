/**
 * routes/scores.js — Rutas de la API de scores
 * GET  /api/scores       → Top 10 scores
 * POST /api/scores       → Guardar nuevo score
 */
import { Router } from 'express';
import pool        from '../db.js';

const router = Router();

// ────────────────────────────────────────────────────────────────
// GET /api/scores
// Devuelve los 10 mejores scores, ordenados por puntos DESC y tiempo ASC
// ────────────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, puntos, tiempo, fecha
      FROM   score
      ORDER  BY puntos DESC, tiempo ASC
      LIMIT  10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /scores → Error:', err.message);
    res.status(500).json({ success: false, message: 'Error al consultar scores' });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/scores
// Body esperado: { nombre: string, puntos: number, tiempo: number }
// ────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { nombre, puntos, tiempo } = req.body;

  // Validación
  if (
    typeof nombre !== 'string' || !nombre.trim() ||
    typeof puntos !== 'number' ||
    typeof tiempo !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Se requieren: nombre (string), puntos (number), tiempo (number)',
    });
  }

  const nombreLimpio = nombre.trim().substring(0, 100);

  try {
    const [result] = await pool.query(
      'INSERT INTO score (nombre, puntos, tiempo) VALUES (?, ?, ?)',
      [nombreLimpio, puntos, tiempo]
    );

    const [rows] = await pool.query(
      'SELECT * FROM score WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('POST /scores → Error:', err.message);
    res.status(500).json({ success: false, message: 'Error al guardar el score' });
  }
});

export default router;
