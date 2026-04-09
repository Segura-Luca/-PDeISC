// 'export' permite que estas funciones se puedan usar en otros archivos mediante 'import'
// Usamos funciones de flecha (=>), que son una forma corta de escribir funciones
export const sumar = (a, b) => a + b;
export const restar = (a, b) => a - b;
export const multiplicar = (a, b) => a * b;
export const dividir = (a, b) => (b !== 0 ? a / b : "Error: División por cero");
