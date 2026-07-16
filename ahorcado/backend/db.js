/**
 * db.js — Pool de conexiones a MySQL
 * Usa mysql2/promise para soporte async/await nativo
 */
import mysql  from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'Score',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Verificar conexión al arrancar el servidor
pool.getConnection()
  .then(conn => {
    console.log('✅  Conexión a MySQL establecida correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('❌  Error al conectar con MySQL:', err.message);
    console.error('    Verificá que MySQL esté corriendo y que las credenciales en .env sean correctas.');
  });

export default pool;
