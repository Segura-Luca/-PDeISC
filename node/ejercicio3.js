function sumar(a, b) {
    return a + b;
}

function restar(a, b) {
    return a - b;
}

function multiplicar(a, b) {
    return a * b;
}

function dividir(a, b) {
    if (b === 0) return "No se puede dividir por cero";
    return a / b;
}


console.log("Resultado suma:", sumar(4, 5));
console.log("Resultado resta:", restar(3, 6));
console.log("Resultado multiplicación:", multiplicar(2, 7));
console.log("Resultado división:", dividir(20, 4));