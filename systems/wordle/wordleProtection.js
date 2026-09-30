const db = require("../../database");

// ============================================================
// 🛡️ WORDLE PROTECTION / PARTIDAS
// ============================================================

async function crearTablas() {

    // Partidas activas
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_partidas (
            discord_id TEXT PRIMARY KEY,
            palabra TEXT NOT NULL,
            intentos JSONB DEFAULT '[]'::jsonb,
            max_intentos INTEGER DEFAULT 6,
            terminada BOOLEAN DEFAULT false,
            victoria BOOLEAN DEFAULT false,
            wordle_id INTEGER
        )
    `);

    // Dailys jugados
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_daily_jugados (
            discord_id TEXT NOT NULL,
            wordle_id INTEGER NOT NULL,
            jugado_en TIMESTAMP DEFAULT NOW(),

            PRIMARY KEY (
                discord_id,
                wordle_id
            )
        )
    `);

    // Wordles creados por administradores
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_creados (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL DEFAULT 'daily',
            palabra TEXT NOT NULL,
            creado_por TEXT NOT NULL,
            creado_en TIMESTAMP DEFAULT NOW(),
            expira_en TIMESTAMP NOT NULL,
            activo BOOLEAN DEFAULT true
        )
    `);
}

// ============================================================
// 🎮 OBTENER PARTIDA
// ============================================================

async function obtenerPartida(userId, wordleId = null) {

    await crearTablas();

    let result;

    if (wordleId !== null) {

        result = await db.query(
            `
            SELECT *
            FROM wordle_partidas
            WHERE discord_id = $1
              AND wordle_id = $2
            `,
            [
                userId,
                wordleId
            ]
        );

    } else {

        result = await db.query(
            `
            SELECT *
            FROM wordle_partidas
            WHERE discord_id = $1
            `,
            [userId]
        );

    }

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    return {
        palabra: row.palabra,
        intentos: row.intentos || [],
        maxIntentos: row.max_intentos,
        terminada: row.terminada,
        victoria: row.victoria,
        wordleId: row.wordle_id
    };
}

// ============================================================
// 💾 GUARDAR PARTIDA
// ============================================================

async function guardarPartida(
    userId,
    wordleId,
    partida
) {

    await crearTablas();

    await db.query(
        `
        INSERT INTO wordle_partidas
        (
            discord_id,
            palabra,
            intentos,
            max_intentos,
            terminada,
            victoria,
            wordle_id
        )

        VALUES
        ($1, $2, $3, $4, $5, $6, $7)

        ON CONFLICT (discord_id)

        DO UPDATE SET
            palabra = EXCLUDED.palabra,
            intentos = EXCLUDED.intentos,
            max_intentos = EXCLUDED.max_intentos,
            terminada = EXCLUDED.terminada,
            victoria = EXCLUDED.victoria,
            wordle_id = EXCLUDED.wordle_id
        `,
        [
            userId,
            partida.palabra,
            JSON.stringify(partida.intentos || []),
            partida.maxIntentos || 6,
            partida.terminada || false,
            partida.victoria || false,
            wordleId
        ]
    );
}

// ============================================================
// ❌ ELIMINAR PARTIDA
// ============================================================

async function eliminarPartida(userId) {

    await crearTablas();

    await db.query(
        `
        DELETE FROM wordle_partidas
        WHERE discord_id = $1
        `,
        [userId]
    );
}

// ============================================================
// 📅 ¿YA JUGÓ ESTE DAILY?
// ============================================================

async function yaJugoDaily(
    userId,
    wordleId
) {

    await crearTablas();

    const result = await db.query(
        `
        SELECT 1
        FROM wordle_daily_jugados
        WHERE discord_id = $1
          AND wordle_id = $2
        `,
        [
            userId,
            wordleId
        ]
    );

    return result.rows.length > 0;
}

// ============================================================
// 📅 MARCAR DAILY JUGADO
// ============================================================

async function marcarDailyJugado(
    userId,
    wordleId
) {

    await crearTablas();

    await db.query(
        `
        INSERT INTO wordle_daily_jugados
        (
            discord_id,
            wordle_id
        )

        VALUES
        ($1, $2)

        ON CONFLICT DO NOTHING
        `,
        [
            userId,
            wordleId
        ]
    );
}

module.exports = {
    crearTablas,
    obtenerPartida,
    guardarPartida,
    eliminarPartida,
    yaJugoDaily,
    marcarDailyJugado
};