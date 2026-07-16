-- =====================================================
--  El Ahorcado — Script de configuración MySQL
--  Ejecutar este archivo en MySQL Workbench o
--  en la línea de comandos: mysql -u root -p < db_setup.sql
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS Score
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Score;

-- Crear la tabla de scores
CREATE TABLE IF NOT EXISTS score (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL,
  puntos  INT          NOT NULL DEFAULT 0,
  tiempo  INT          NOT NULL DEFAULT 0,   -- tiempo en segundos
  fecha   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_puntos (puntos DESC),
  INDEX idx_fecha  (fecha  DESC)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Datos de demo (opcional — borrá este bloque si no querés datos iniciales)
INSERT INTO score (nombre, puntos, tiempo) VALUES
  ('Campeón 🏆',    950, 22),
  ('Pro Gamer',     800, 35),
  ('Principiante',  400, 95);
