// ============================================================
// 🟩 WORDLE WORDS — ADAPTADOR DEL SISTEMA
// ============================================================

const {
    EASY,
    EASY_UNIQUE,
    DAILY_EASY,
    MEDIUM,
    HARD,
    EXTREME,
    getRandomEasyWord
} = require("./wordleWord");

function normalizarPalabra(word) {
    return String(word ?? "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerLista(dificultad = "EASY") {
    const dificultadNormalizada = String(dificultad).toUpperCase();

    switch (dificultadNormalizada) {
        case "EASY":
            return DAILY_EASY;

        case "MEDIUM":
            return MEDIUM;

        case "HARD":
            return HARD;

        case "EXTREME":
            return EXTREME;

        default:
            return DAILY_EASY;
    }
}

function obtenerPalabraAleatoria(dificultad = "EASY") {
    const lista = obtenerLista(dificultad);

    if (!lista || lista.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * lista.length);
    return lista[index];
}

function getRandomEasyWordCompatible() {
    return getRandomEasyWord();
}

function esPalabraValida(palabra, dificultad = "EASY") {
    const palabraNormalizada = normalizarPalabra(palabra);
    const lista = obtenerLista(dificultad);

    return lista.some(word =>
        normalizarPalabra(word) === palabraNormalizada
    );
}

function obtenerRangoLongitud(dificultad = "EASY") {
    switch (String(dificultad).toUpperCase()) {
        case "EASY":
            return { minimo: 3, maximo: 5 };

        case "MEDIUM":
            return { minimo: 6, maximo: 7 };

        case "HARD":
            return { minimo: 8, maximo: 12 };

        case "EXTREME":
            return { minimo: 12, maximo: 15 };

        default:
            return { minimo: 3, maximo: 5 };
    }
}

function longitudValida(palabra, dificultad = "EASY") {
    const limpia = normalizarPalabra(palabra);
    const rango = obtenerRangoLongitud(dificultad);

    return (
        limpia.length >= rango.minimo &&
        limpia.length <= rango.maximo
    );
}

module.exports = {
    EASY,
    EASY_UNIQUE,
    DAILY_EASY,
    MEDIUM,
    HARD,
    EXTREME,
    normalizarPalabra,
    esPalabraValida,
    longitudValida,
    obtenerLista,
    obtenerRangoLongitud,
    obtenerPalabraAleatoria,
    getRandomEasyWord: getRandomEasyWordCompatible
};