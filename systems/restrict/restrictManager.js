const pool = require("../../database");

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Tablas que contienen datos PERSONALES de los usuarios.
//
// IMPORTANTE:
// Agrega aquí solamente tablas que realmente tengan datos
// pertenecientes a un usuario.
//
// Todas deben tener una columna "user_id" con el Discord ID.
//
// NO agregues aquí tablas globales como settings, market global,
// configuración del bot, etc.
const USER_DATA_TABLES = [
    // "users",
    // "inventory",
    // "daily_stats",
    // "tragamonedas",
    // "missions",
    // "gifts"
];

// ============================================================
// TABLA DE RESTRICCIONES
// ============================================================

async function ensureRestrictionsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ketchuru_restrictions (
            user_id VARCHAR(30) PRIMARY KEY,
            type VARCHAR(20) NOT NULL,
            expires_at TIMESTAMPTZ NULL,
            reason TEXT NOT NULL,
            appeal BOOLEAN NULL,
            restricted_by VARCHAR(30) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

// ============================================================
// PARSEAR DURACIÓN
// ============================================================

function parseDuration(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    const match = value.trim().match(/^(\d+)([dMy])$/);

    if (!match) {
        return null;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    if (amount <= 0) {
        return null;
    }

    const now = new Date();

    if (unit === "d") {
        now.setDate(now.getDate() + amount);
    }

    else if (unit === "M") {
        now.setMonth(now.getMonth() + amount);
    }

    else if (unit === "y") {
        now.setFullYear(now.getFullYear() + amount);
    }

    return now;
}

// ============================================================
// COMPROBAR SI ESTÁ RESTRINGIDO
// ============================================================

async function getRestriction(userId) {
    await ensureRestrictionsTable();

    const result = await pool.query(
        `
        SELECT *
        FROM ketchuru_restrictions
        WHERE user_id = $1
        `,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const restriction = result.rows[0];

    // Permanente
    if (restriction.type === "permanent") {
        return restriction;
    }

    // Temporal expirada
    if (
        restriction.expires_at &&
        new Date(restriction.expires_at) <= new Date()
    ) {
        await pool.query(
            `
            DELETE FROM ketchuru_restrictions
            WHERE user_id = $1
            `,
            [userId]
        );

        return null;
    }

    return restriction;
}

// ============================================================
// OBTENER TODAS LAS RESTRICCIONES ACTIVAS
// ============================================================
//
// Se usa principalmente para !restrictusers /restrictusers.
//
// También limpia automáticamente las restricciones temporales
// que ya hayan expirado.
// ============================================================

async function getAllRestrictions() {
    await ensureRestrictionsTable();

    // Eliminar temporales expiradas.
    await pool.query(
        `
        DELETE FROM ketchuru_restrictions
        WHERE type = 'temporary'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW()
        `
    );

    const result = await pool.query(
        `
        SELECT *
        FROM ketchuru_restrictions
        ORDER BY created_at DESC
        `
    );

    return result.rows;
}

// ============================================================
// CREAR RESTRICCIÓN
// ============================================================

async function createRestriction({
    userId,
    type,
    duration,
    reason,
    appeal,
    restrictedBy
}) {
    await ensureRestrictionsTable();

    const expiresAt =
        type === "permanent"
            ? null
            : duration;

    // Si ya existe una restricción, la reemplazamos.
    await pool.query(
        `
        INSERT INTO ketchuru_restrictions
        (
            user_id,
            type,
            expires_at,
            reason,
            appeal,
            restricted_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)

        ON CONFLICT (user_id)
        DO UPDATE SET
            type = EXCLUDED.type,
            expires_at = EXCLUDED.expires_at,
            reason = EXCLUDED.reason,
            appeal = EXCLUDED.appeal,
            restricted_by = EXCLUDED.restricted_by,
            created_at = NOW()
        `,
        [
            userId,
            type,
            expiresAt,
            reason,
            type === "permanent" ? appeal : null,
            restrictedBy
        ]
    );

    // ========================================================
    // BORRADO DE PROGRESO
    // ========================================================
    //
    // SOLO ocurre con una restricción PERMANENTE.
    //
    // La restricción temporal conserva todo el progreso.
    //

    if (type === "permanent") {
        await deleteUserData(userId);
    }

    return getRestriction(userId);
}

// ============================================================
// BORRAR DATOS DEL USUARIO
// ============================================================

async function deleteUserData(userId) {

    if (USER_DATA_TABLES.length === 0) {
        console.warn(
            `⚠️ Restrict: no hay tablas de datos configuradas para borrar para ${userId}.`
        );

        return;
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        for (const table of USER_DATA_TABLES) {

            // Protección contra nombres SQL inválidos.
            if (!/^[a-zA-Z0-9_]+$/.test(table)) {
                throw new Error(
                    `Nombre de tabla inválido: ${table}`
                );
            }

            console.log(
                `🗑️ Restrict: eliminando datos de ${userId} en ${table}`
            );

            await client.query(
                `
                DELETE FROM "${table}"
                WHERE user_id = $1
                `,
                [userId]
            );
        }

        await client.query("COMMIT");

        console.log(
            `🗑️ Datos de KetchuruBot eliminados para ${userId}.`
        );

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            `❌ Error eliminando datos de ${userId}:`,
            error
        );

        throw error;

    } finally {

        client.release();
    }
}

// ============================================================
// ELIMINAR RESTRICCIÓN INDIVIDUAL
// ============================================================
//
// Elimina cualquier tipo de restricción:
// - temporary
// - permanent
//
// NO restaura datos eliminados por una restricción permanente.
// ============================================================

async function removeRestriction(userId) {

    await ensureRestrictionsTable();

    const result = await pool.query(
        `
        DELETE FROM ketchuru_restrictions
        WHERE user_id = $1
        RETURNING *
        `,
        [userId]
    );

    return result.rows[0] || null;
}

// ============================================================
// UNRESTRICT USER
// ============================================================

async function unrestrictUser(userId) {

    const removedRestriction = await removeRestriction(userId);

    if (!removedRestriction) {
        return false;
    }

    console.log(
        `🔓 Unrestrict: restricción eliminada para ${userId} (${removedRestriction.type}).`
    );

    return removedRestriction;
}

// ============================================================
// UNRESTRICT GLOBAL
// ============================================================
//
// Elimina TODAS las restricciones existentes.
//
// exceptUserIds contiene los usuarios que NO deben ser
// desrestringidos.
// ============================================================

async function unrestrictGlobal(exceptUserIds = []) {

    await ensureRestrictionsTable();

    const exceptions = [
        ...new Set(
            exceptUserIds
                .filter(Boolean)
                .map(id => String(id))
        )
    ];

    let result;

    if (exceptions.length === 0) {

        result = await pool.query(
            `
            DELETE FROM ketchuru_restrictions
            RETURNING *
            `
        );

    } else {

        result = await pool.query(
            `
            DELETE FROM ketchuru_restrictions
            WHERE NOT (user_id = ANY($1::varchar[]))
            RETURNING *
            `,
            [exceptions]
        );
    }

    console.log(
        `🔓 Unrestrict Global: ${result.rowCount} restricción(es) eliminada(s).`
    );

    if (exceptions.length > 0) {
        console.log(
            `🛡️ Excepciones protegidas: ${exceptions.join(", ")}`
        );
    }

    return result.rows;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    parseDuration,
    getRestriction,
    getAllRestrictions,
    createRestriction,
    removeRestriction,
    unrestrictUser,
    unrestrictGlobal,
    deleteUserData
};