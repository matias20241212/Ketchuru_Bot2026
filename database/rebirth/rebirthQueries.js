// =====================================================
// 🔄 OBTENER REBIRTH DE UN USUARIO
// =====================================================

async function obtenerRebirth(db, id) {

    const result = await db.query(
        `
        SELECT rebirth
        FROM users
        WHERE discord_id=$1
        `,
        [id]
    );

    if (result.rows.length === 0) {

        return 0;

    }

    return Number(result.rows[0].rebirth || 0);

}


// =====================================================
// ⬆️ SUBIR REBIRTH
// =====================================================

async function subirRebirth(db, id) {

    const result = await db.query(
        `
        UPDATE users

        SET rebirth = COALESCE(rebirth, 0) + 1,
            rebirth_points = COALESCE(rebirth_points, 0)

        WHERE discord_id=$1

        RETURNING rebirth, rebirth_points
        `,
        [id]
    );

    return result.rows[0] || {
        rebirth: 0,
        rebirth_points: 0
    };

}


// =====================================================
// 🏆 TOP REBIRTH
// =====================================================

async function obtenerTopRebirth(db) {

    const result = await db.query(
        `
        SELECT discord_id, rebirth
        FROM users
        ORDER BY rebirth DESC
        LIMIT 10
        `
    );

    return result.rows;

}


// =====================================================
// 📊 DATOS DE REBIRTH
// =====================================================

async function obtenerDatosRebirth(db, id) {

    const result = await db.query(
        `
        SELECT rebirth, rebirth_points
        FROM users
        WHERE discord_id=$1
        `,
        [id]
    );

    return result.rows[0] || {
        rebirth: 0,
        rebirth_points: 0
    };

}


// =====================================================
// 📦 EXPORTACIONES
// =====================================================

module.exports = {

    obtenerRebirth,

    subirRebirth,

    obtenerTopRebirth,

    obtenerDatosRebirth

};