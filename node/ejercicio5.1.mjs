import http from 'http';
import { sumar, restar, multiplicar, dividir } from './ejercicio5.mjs';

const server = http.createServer((req, res) => {
    //  Creamos un array de objetos con las operaciones y sus resultados reales
    const resultados = [
        { op: "Suma (5 + 3)", res: sumar(5, 3) },
        { op: "Resta (8 - 6)", res: restar(8, 6) },
        { op: "Multiplicación (3 * 11)", res: multiplicar(3, 11) },
        { op: "División (30 / 5)", res: dividir(30, 5) }
    ];

    // Construimos las filas de la tabla
    const filas = resultados.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.op}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-family: monospace;">${item.res}</td>
        </tr>
    `).join('');

    // Preparamos el HTML completo
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Servidor Node.js</title>
        <style>
            body { font-family: sans-serif; display: flex; justify-content: center; padding: 40px; background-color: #eef2f3; }
            table { background: white; border-collapse: collapse; width: 350px; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            th { background-color: #34495e; color: white; padding: 15px; text-align: left; }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr><th>Operación</th><th>Resultado</th></tr>
            </thead>
            <tbody>
                ${filas}
            </tbody>
        </table>
    </body>
    </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
