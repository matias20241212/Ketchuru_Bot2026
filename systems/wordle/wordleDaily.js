// ============================================================
// 🟨 WORDLE DAILY
// ============================================================

const {
    obtenerPalabraAleatoria
} = require("./wordleWord");

const {
    crearPartida
} = require("./wordleGame");

const protection =
    require("./wordleProtection");

const db =
    require("../../database");


// ============================================================
// 🇨🇱 FECHA CHILE
// ============================================================

function obtenerFechaChile() {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "America/Santiago"
        }
    ).format(
        new Date()
    );

}


// ============================================================
// 🕛 PRÓXIMO MEDIODÍA CHILE
// ============================================================

function obtenerProximoMediodia() {

    const ahora =
        new Date();

    const partes =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: "America/Santiago",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).formatToParts(
            ahora
        );

    const year =
        Number(
            partes.find(
                p => p.type === "year"
            ).value
        );

    const month =
        Number(
            partes.find(
                p => p.type === "month"
            ).value
        );

    const day =
        Number(
            partes.find(
                p => p.type === "day"
            ).value
        );

    // Primero intentamos el mediodía de HOY
    const hoy =
        new Date(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00`
        );

    /*
     * El servidor puede estar en otra zona horaria.
     * Por eso calculamos usando la diferencia entre
     * Chile y UTC.
     */

    const chileString =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: "America/Santiago",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        ).format(
            ahora
        );

    const ahoraChile =
        new Date(
            chileString
        );

    let objetivo =
        hoy;

    if (
        ahoraChile >= hoy
    ) {

        objetivo =
            new Date(
                hoy.getTime() +
                24 * 60 * 60 * 1000
            );

    }

    return objetivo;

}


// ============================================================
// 🟨 OBTENER DAILY ACTIVO
// ============================================================

async function obtenerDailyActivo() {

    const resultado =
        await db.query(
            `
            SELECT *
            FROM wordle_events
            WHERE type = 'daily'
              AND active = TRUE
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
            `
        );

    return resultado.rows[0] || null;

}


// ============================================================
// 🎮 INICIAR DAILY
// ============================================================

async function iniciarDaily(
    userId,
    wordleId = null
) {

    let daily;

    if (
        wordleId
    ) {

        const resultado =
            await db.query(
                `
                SELECT *
                FROM wordle_events
                WHERE id = $1
                  AND active = TRUE
                  AND expires_at > NOW()
                `,
                [
                    wordleId
                ]
            );

        daily =
            resultado.rows[0];

    } else {

        daily =
            await obtenerDailyActivo();

    }

    if (
        !daily
    ) {

        return {
            ok: false,
            error:
                "No hay ningún Wordle Daily activo."
        };

    }

    const partidaExistente =
        protection.obtenerPartida(
            userId,
            daily.id
        );

    if (
        partidaExistente
    ) {

        return {
            ok: false,
            error:
                "Ya tienes una partida activa de este Wordle."
        };

    }

    const jugado =
        await db.query(
            `
            SELECT id
            FROM wordle_games
            WHERE wordle_id = $1
              AND user_id = $2
            LIMIT 1
            `,
            [
                daily.id,
                userId
            ]
        );

    if (
        jugado.rows.length > 0
    ) {

        return {
            ok: false,
            error:
                "Ya jugaste este Wordle."
        };

    }

    const partida =
        crearPartida(
            daily.word
        );

    protection.guardarPartida(
        userId,
        daily.id,
        partida
    );

    return {
        ok: true,
        partida,
        daily
    };

}


// ============================================================
// 📤 EXPORTAR
// ============================================================

module.exports = {

    iniciarDaily,

    obtenerFechaChile,

    obtenerDailyActivo,

    obtenerProximoMediodia

};