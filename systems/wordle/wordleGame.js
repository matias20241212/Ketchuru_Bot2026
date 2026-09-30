const { evaluarIntento, crearTablero } = require("./wordleUtils");
const { esPalabraValida, normalizarPalabra } = require("./wordleWords");

function crearPartida(palabra, dificultad = "EASY") {
    const palabraNormalizada = normalizarPalabra(palabra);

    return {
        palabra: palabraNormalizada,
        dificultad,
        intentos: [],
        maxIntentos: 6,
        terminada: false,
        victoria: false
    };
}

function realizarIntento(partida, intento) {
    if (partida.terminada) {
        return {
            ok: false,
            error: "La partida ya terminó."
        };
    }

    intento = normalizarPalabra(intento);

    const longitudObjetivo = partida.palabra.length;

    if (intento.length !== longitudObjetivo) {
        return {
            ok: false,
            error: `La palabra debe tener exactamente ${longitudObjetivo} letras.`
        };
    }

    if (!esPalabraValida(intento, partida.dificultad || "EASY")) {
        return {
            ok: false,
            error: "Esa palabra no está en el diccionario."
        };
    }

    const resultado = evaluarIntento(
        intento,
        partida.palabra
    );

    partida.intentos.push({
        palabra: intento,
        resultado
    });

    if (intento === partida.palabra) {
        partida.terminada = true;
        partida.victoria = true;
    } else if (
        partida.intentos.length >= partida.maxIntentos
    ) {
        partida.terminada = true;
        partida.victoria = false;
    }

    return {
        ok: true,
        resultado,
        tablero: crearTablero(partida.intentos),
        terminada: partida.terminada,
        victoria: partida.victoria
    };
}

module.exports = {
    crearPartida,
    realizarIntento
};