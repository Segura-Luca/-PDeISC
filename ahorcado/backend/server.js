/**
 * server.js — Punto de entrada del servidor Express
 * API REST para El Ahorcado
 */
import express      from 'express';
import cors         from 'cors';
import dotenv       from 'dotenv';
import path         from 'path';
import { fileURLToPath } from 'url';
import scoresRouter from './routes/scores.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Servir la carpeta frontend estáticamente en http://localhost:3001/
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Rutas ────────────────────────────────────────────────────────
// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'El Ahorcado', timestamp: new Date().toISOString() });
});

// Scores
app.use('/api/scores', scoresRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error global
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('  🎮  El Ahorcado — Servidor iniciado');
  console.log('═══════════════════════════════════════════');
  console.log(`  🌐  URL:    http://localhost:${PORT}`);
  console.log(`  📊  Scores: http://localhost:${PORT}/api/scores`);
  console.log(`  💓  Health: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════\n');
});
