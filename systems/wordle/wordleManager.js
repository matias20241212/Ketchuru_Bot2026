const { realizarIntento, crearPartida } = require("./wordleGame");
const protection = require("./wordleProtection");
const { calcularRacha } = require("./wordleStreak");
const { obtenerStats, registrarPartida } = require("./wordleDatabase");
const { darRecompensa, calcularRecompensa } = require("./wordleRewards");
const { obtenerPalabraAleatoria } = require("./wordleWords");

async function iniciarJuego(message, palabra, userId) {
    const objetivo = obtenerPalabraAleatoria("EASY");

    if (!objetivo) {
        return message.reply(
            "❌ No se pudo obtener una palabra de Wordle."
        );
    }

    const partidaExistente =
        await protection.obtenerPartida(userId, null);

    if (partidaExistente) {
        return message.reply(
            "⚠️ Ya tienes una partida de Wordle activa."
        );
    }

    const partida =
        crearPartida(objetivo, "EASY");

    await protection.guardarPartida(
        userId,
        null,
        partida
    );

    return message.reply(
        "🟩 **Wordle iniciado**\n\n" +
        "Escribe tu primer intento en este canal."
    );
}


// ============================================================
// 🟩 PROCESAR INTENTO
// ============================================================

async function procesarIntento(
    userId,
    palabra,
    wordleId = null
) {

    const partida =
        await protection.obtenerPartida(
            userId,
            wordleId
        );

    if (!partida) {
        return {
            ok: false,
            error: "No tienes una partida activa."
        };
    }

    const resultado =
        realizarIntento(
            partida,
            palabra
        );

    if (!resultado.ok) {
        return resultado;
    }

    if (!resultado.terminada) {

        await protection.guardarPartida(
            userId,
            partida.wordleId || wordleId,
            partida
        );

        return resultado;
    }

    const stats =
        await obtenerStats(userId);

    const {
        racha,
        mejorRacha
    } = calcularRacha(
        stats,
        resultado.victoria
    );

    await registrarPartida(
        userId,
        resultado.victoria,
        racha,
        mejorRacha
    );

    let recompensa = 0;

    if (resultado.victoria) {

        recompensa =
            calcularRecompensa(
                partida.intentos.length
            );

        await darRecompensa(
            userId,
            recompensa
        );
    }

    if (partida.wordleId) {

        await protection.marcarDailyJugado(
            userId,
            partida.wordleId
        );
    }

    await protection.eliminarPartida(
        userId
    );

    return {
        ...resultado,
        recompensa,
        racha,
        mejorRacha,
        palabra: partida.palabra,
        wordleId:
            partida.wordleId || wordleId
    };
}


// ============================================================
// 🔄 REINICIAR ÚLTIMO INTENTO
// ============================================================

async function reiniciarIntento(userId) {

    const partida =
        await protection.obtenerPartida(
            userId,
            null
        );

    if (!partida) {

        return {
            ok: false,
            error:
                "No tienes una partida activa."
        };
    }

    if (
        !partida.intentos ||
        partida.intentos.length === 0
    ) {

        return {
            ok: false,
            error:
                "No tienes un intento para reiniciar."
        };
    }

    const ultimoIntento =
        partida.intentos[
            partida.intentos.length - 1
        ];

    const fueCorrecto =
        ultimoIntento.resultado.every(
            resultado =>
                resultado === "green"
        );

    if (fueCorrecto) {

        return {
            ok: false,
            error:
                "Ese intento ya era correcto."
        };
    }

    // El intento se considera gastado
    partida.intentosGastados =
        Number(
            partida.intentosGastados || 0
        ) + 1;

    // Quitamos el intento del tablero
    partida.intentos.pop();

    const intentosRestantes =
        partida.maxIntentos -
        partida.intentosGastados;

    // Si ya no quedan intentos
    if (intentosRestantes <= 0) {

        partida.terminada = true;
        partida.victoria = false;

        await protection.eliminarPartida(
            userId
        );

        return {
            ok: true,
            perdida: true,
            intentosRestantes: 0,
            palabra: partida.palabra
        };
    }

    await protection.guardarPartida(
        userId,
        partida.wordleId || null,
        partida
    );

    return {
        ok: true,
        perdida: false,
        tablero: partida.intentos,
        intentosRestantes
    };
}


// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {

    ejecutar: iniciarJuego,

    jugar: iniciarJuego,

    iniciar: iniciarJuego,

    iniciarJuego,

    procesarIntento,

    reiniciarIntento

};