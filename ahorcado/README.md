# 🎮 El Ahorcado — Full Stack

Juego del ahorcado con palabras en español, backend Node.js, base de datos MySQL y descarga de PDF.

---

## 🗂 Estructura del proyecto

```
ahorcado/
├── backend/
│   ├── .env              ← Credenciales de MySQL (NO subir a git)
│   ├── package.json
│   ├── server.js         ← Servidor Express (puerto 3001)
│   ├── db.js             ← Pool de conexión MySQL2
│   ├── db_setup.sql      ← Script para crear la BD y la tabla
│   └── routes/
│       └── scores.js     ← GET y POST /api/scores
│
└── frontend/
    ├── index.html        ← Página principal (Bootstrap 5 + importmap)
    ├── css/
    │   └── styles.css    ← Tema oscuro/claro, animaciones, responsive
    └── js/
        ├── main.js           ← Punto de entrada (import UIManager)
        ├── Game.js           ← Lógica del juego (clase Game)
        ├── WordAPI.js        ← Fetch de palabra en español (con fallback)
        ├── HangmanSVG.js     ← Dibujo SVG del muñeco (clase HangmanSVG)
        ├── SoundManager.js   ← Sonidos Web Audio API (clase SoundManager)
        ├── ScoreManager.js   ← Comunicación fetch con la API (clase ScoreManager)
        ├── PDFManager.js     ← Generación de PDF con jsPDF (clase PDFManager)
        └── UIManager.js      ← Coordinador de UI (clase UIManager)
```

---

## 🚀 Instalación paso a paso

### 1. Base de datos MySQL

Abrí **MySQL Workbench** (o cualquier cliente MySQL) y ejecutá:

```sql
-- Pega el contenido de backend/db_setup.sql y ejecuta
```

Esto crea la base de datos `Score` y la tabla `score`.

### 2. Backend (Node.js)

```bash
cd backend
npm install
node server.js
```

Vas a ver:
```
✅  Conexión a MySQL establecida correctamente
🌐  URL:    http://localhost:3001
📊  Scores: http://localhost:3001/api/scores
```

### 3. Frontend

Abrí `frontend/index.html` con **Live Server** de VS Code
(botón derecho → *Open with Live Server*)  
o con cualquier servidor HTTP estático en el puerto 5500.

> ⚠️ El frontend usa `import` nativo del navegador — no abrir `index.html` directamente con doble clic (file://), necesita un servidor HTTP.

---

## 🔌 API Endpoints

| Método | Ruta              | Body / Response                               |
|--------|-------------------|----------------------------------------------|
| GET    | `/api/health`     | `{ status, timestamp }`                      |
| GET    | `/api/scores`     | `{ success, data: [{ id, nombre, puntos, tiempo, fecha }] }` |
| POST   | `/api/scores`     | Body: `{ nombre, puntos, tiempo }` → `{ success, data }` |

---

## 🎯 Características

| Feature | Detalle |
|---------|---------|
| Palabras | API `random-word-api.vercel.app` con 65 palabras de fallback |
| Sonidos | Web Audio API sintética (sin archivos externos) |
| Dark/Light | Toggle en el header, persiste en localStorage |
| Teclado | Virtual (click) + Físico (keydown) |
| Responsive | Bootstrap 5 grid + breakpoints propios |
| PDF | jsPDF ES module via importmap |
| Sin alerts | Todos los mensajes usan Bootstrap Toasts y Modals |
| Imports | Todos los módulos usan `import`/`export` ES Modules |

---

## 📦 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend estructura | HTML5 semántico + ARIA |
| Frontend estilos | Bootstrap 5 + CSS Variables (dark/light) |
| Frontend lógica | JavaScript ES Modules (`import`/`export`) |
| Gráfico ahorcado | SVG animado (CSS animations) |
| Sonidos | Web Audio API |
| PDF | jsPDF 2.5.1 (ES module) |
| Backend | Node.js + Express 4 |
| BD | MySQL2 (driver con Promises) |
| Configuración | dotenv (.env) |

---

## 🗃 Base de datos

```sql
CREATE TABLE score (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL,
  puntos  INT          NOT NULL DEFAULT 0,
  tiempo  INT          NOT NULL DEFAULT 0,   -- segundos
  fecha   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

> **Seguridad**: el archivo `.env` contiene las credenciales de MySQL. Nunca lo subas a git. Está incluido en `.gitignore` (si usás control de versiones).
