// ============================================================
// 🗄️ WORDLE DATABASE - NEON / POSTGRESQL
// ============================================================

const db = require("../../database");


// ============================================================
// 🧱 CREAR TABLAS
// ============================================================

let tablasPreparadas = false;

async function crearTabla() {

    if (tablasPreparadas) return;

    // Estadísticas de Wordle
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_stats (
            discord_id TEXT PRIMARY KEY,
            partidas INTEGER NOT NULL DEFAULT 0,
            victorias INTEGER NOT NULL DEFAULT 0,
            derrotas INTEGER NOT NULL DEFAULT 0,
            racha INTEGER NOT NULL DEFAULT 0,
            mejor_racha INTEGER NOT NULL DEFAULT 0,
            ultimo_dia TEXT
        )
    `);

    // Wordles creados
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_events (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL DEFAULT 'daily',
            word TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE
        )
    `);

    // Partidas terminadas
    await db.query(`
        CREATE TABLE IF NOT EXISTS wordle_games (
            id SERIAL PRIMARY KEY,
            wordle_id INTEGER NOT NULL
                REFERENCES wordle_events(id)
                ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            attempts JSONB NOT NULL DEFAULT '[]',
            finished BOOLEAN NOT NULL DEFAULT FALSE,
            victory BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(wordle_id, user_id)
        )
    `);

    tablasPreparadas = true;
}


// ============================================================
// 📊 OBTENER STATS
// ============================================================

async function obtenerStats(discordId) {

    await crearTabla();

    const result = await db.query(`
        SELECT *
        FROM wordle_stats
        WHERE discord_id = $1
    `, [discordId]);

    if (result.rows.length === 0) {

        await db.query(`
            INSERT INTO wordle_stats (
                discord_id,
                partidas,
                victorias,
                derrotas,
                racha,
                mejor_racha,
                ultimo_dia
            )
            VALUES ($1, 0, 0, 0, 0, 0, NULL)
        `, [discordId]);

        return {
            discord_id: discordId,
            partidas: 0,
            victorias: 0,
            derrotas: 0,
            racha: 0,
            mejor_racha: 0,
            ultimo_dia: null
        };
    }

    return result.rows[0];
}


// ============================================================
// 🏆 REGISTRAR PARTIDA
// ============================================================

async function registrarPartida(
    discordId,
    victoria,
    racha,
    mejorRacha
) {

    await crearTabla();

    const victorias = victoria ? 1 : 0;
    const derrotas = victoria ? 0 : 1;

    await db.query(`
        INSERT INTO wordle_stats (
            discord_id,
            partidas,
            victorias,
            derrotas,
            racha,
            mejor_racha,
            ultimo_dia
        )
        VALUES (
            $1,
            1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_DATE::TEXT
        )

        ON CONFLICT (discord_id)

        DO UPDATE SET

            partidas =
                wordle_stats.partidas + 1,

            victorias =
                wordle_stats.victorias + $2,

            derrotas =
                wordle_stats.derrotas + $3,

            racha =
                $4,

            mejor_racha =
                GREATEST(
                    wordle_stats.mejor_racha,
                    $5
                ),

            ultimo_dia =
                CURRENT_DATE::TEXT
    `, [
        discordId,
        victorias,
        derrotas,
        racha,
        mejorRacha
    ]);
}


// ============================================================
// 🟨 CREAR WORDLE
// ============================================================

async function crearWordle(
    name,
    word,
    createdBy,
    expiresAt,
    type = "daily"
) {

    await crearTabla();

    const result = await db.query(`
        INSERT INTO wordle_events (
            name,
            type,
            word,
            created_by,
            expires_at,
            active
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            TRUE
        )
        RETURNING *
    `, [
        name,
        type,
        word,
        createdBy,
        expiresAt
    ]);

    return result.rows[0];
}


// ============================================================
// 🔎 OBTENER WORDLE POR ID
// ============================================================

async function obtenerWordle(wordleId) {

    await crearTabla();

    const result = await db.query(`
        SELECT *
        FROM wordle_events
        WHERE id = $1
    `, [wordleId]);

    return result.rows[0] || null;
}


// ============================================================
// 🔎 OBTENER WORDLE POR NOMBRE
// ============================================================

async function obtenerWordlePorNombre(name) {

    await crearTabla();

    const result = await db.query(`
        SELECT *
        FROM wordle_events
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
    `, [name]);

    return result.rows[0] || null;
}


// ============================================================
// 🟢 OBTENER WORDLES ACTIVOS
// ============================================================

async function obtenerWordlesActivos() {

    await crearTabla();

    const result = await db.query(`
        SELECT *
        FROM wordle_events
        WHERE active = TRUE
          AND expires_at > NOW()
        ORDER BY created_at DESC
    `);

    return result.rows;
}


// ============================================================
// 🟨 OBTENER DAILY ACTIVO
// ============================================================

async function obtenerDailyActivo() {

    await crearTabla();

    const result = await db.query(`
        SELECT *
        FROM wordle_events
        WHERE type = 'daily'
          AND active = TRUE
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
    `);

    return result.rows[0] || null;
}


// ============================================================
// 🗑️ DESACTIVAR WORDLE
// ============================================================

async function desactivarWordle(wordleId) {

    await crearTabla();

    const result = await db.query(`
        UPDATE wordle_events
        SET active = FALSE
        WHERE id = $1
        RETURNING *
    `, [wordleId]);

    return result.rows[0] || null;
}


// ============================================================
// 🗑️ DESACTIVAR POR NOMBRE
// ============================================================

async function desactivarWordlePorNombre(name) {

    await crearTabla();

    const result = await db.query(`
        UPDATE wordle_events
        SET active = FALSE
        WHERE LOWER(name) = LOWER($1)
        RETURNING *
    `, [name]);

    return result.rows[0] || null;
}


// ============================================================
// ⏰ FINALIZAR WORDLES EXPIRADOS
// ============================================================

async function finalizarWordlesExpirados() {

    await crearTabla();

    const result = await db.query(`
        UPDATE wordle_events
        SET active = FALSE
        WHERE active = TRUE
          AND expires_at <= NOW()
        RETURNING *
    `);

    return result.rows;
}


// ============================================================
// 🎮 COMPROBAR SI USUARIO YA JUGÓ
// ============================================================

async function yaJugoWordle(
    wordleId,
    userId
) {

    await crearTabla();

    const result = await db.query(`
        SELECT id
        FROM wordle_games
        WHERE wordle_id = $1
          AND user_id = $2
        LIMIT 1
    `, [
        wordleId,
        userId
    ]);

    return result.rows.length > 0;
}


// ============================================================
// 💾 GUARDAR RESULTADO
// ============================================================

async function guardarResultadoWordle(
    wordleId,
    userId,
    attempts,
    victory
) {

    await crearTabla();

    const result = await db.query(`
        INSERT INTO wordle_games (
            wordle_id,
            user_id,
            attempts,
            finished,
            victory
        )
        VALUES (
            $1,
            $2,
            $3,
            TRUE,
            $4
        )

        ON CONFLICT (
            wordle_id,
            user_id
        )

        DO UPDATE SET

            attempts = EXCLUDED.attempts,

            finished = TRUE,

            victory = EXCLUDED.victory

        RETURNING *
    `, [
        wordleId,
        userId,
        JSON.stringify(attempts),
        victory
    ]);

    return result.rows[0];
}


// ============================================================
// 📤 EXPORTAR
// ============================================================

module.exports = {

    crearTabla,

    obtenerStats,

    registrarPartida,

    crearWordle,

    obtenerWordle,

    obtenerWordlePorNombre,

    obtenerWordlesActivos,

    obtenerDailyActivo,

    desactivarWordle,

    desactivarWordlePorNombre,

    finalizarWordlesExpirados,

    yaJugoWordle,

    guardarResultadoWordle

};