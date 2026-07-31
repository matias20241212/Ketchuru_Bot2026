const db = require("../database");


// =========================================
// 🎯 TIPOS DE MISIONES DISPONIBLES
// =========================================

const tiposPermitidos = [
    "slots",
    "buy",
    "messages"
];


// =========================================
// 🎲 OBTENER UNA MISION ALEATORIA DESDE SQL
// =========================================

async function obtenerMisionAleatoria(misionesExistentes = []) {

    let query = `
        SELECT
            id,
            type,
            name,
            description,
            goal,
            reward,
            difficulty,
            category,
            reward_type,
            reward_item,
            reward_rarity,
            reward_coins,
            reward_coupon

        FROM missions

        WHERE type = ANY($1::text[])
    `;


    const valores = [
        tiposPermitidos
    ];


    // Evitar repetir una misión que el usuario
    // ya tenga activa.

    if (misionesExistentes.length > 0) {

        query += `
            AND id <> ALL($2::int[])
        `;

        valores.push(misionesExistentes);
    }


    query += `
        ORDER BY RANDOM()
        LIMIT 1
    `;


    const resultado = await db.query(
        query,
        valores
    );


    if (resultado.rows.length === 0) {
        return null;
    }


    return resultado.rows[0];
}


// =========================================
// 🎯 GENERAR MISIONES PARA UN USUARIO
// =========================================

async function generarMisiones(userId) {

    const actuales = await db.query(
        `
        SELECT mission_id
        FROM user_missions
        WHERE discord_id = $1
        AND completed = false
        `,
        [
            userId
        ]
    );


    // Máximo 5 misiones activas.

    if (actuales.rows.length >= 5) {
        return;
    }


    // IDs de las misiones que ya tiene.

    const misionesExistentes = actuales.rows
        .map(row => row.mission_id)
        .filter(id => id !== null);


    // Cantidad de misiones que faltan.

    const cantidad = 5 - actuales.rows.length;


    // Generar las misiones que faltan.

    for (let i = 0; i < cantidad; i++) {

        const mision = await obtenerMisionAleatoria(
            misionesExistentes
        );


        // No quedan misiones disponibles.

        if (!mision) {

            console.log(
                `⚠️ No quedan misiones disponibles para ${userId}`
            );

            break;
        }


        // Insertar misión del usuario.

        await db.query(
            `
            INSERT INTO user_missions
            (
                discord_id,
                mission_id,
                progress,
                completed,
                rewarded,
                reward_type,
                reward_item,
                reward_rarity,
                reward_coupon,
                reward_coins
            )

            VALUES
            (
                $1,
                $2,
                0,
                false,
                false,
                $3,
                $4,
                $5,
                $6,
                $7
            )
            `,
            [
                userId,

                mision.id,

                mision.reward_type || null,

                mision.reward_item || null,

                mision.reward_rarity || null,

                mision.reward_coupon || null,

                mision.reward_coins || null
            ]
        );


        // Evitar repetirla durante esta generación.

        misionesExistentes.push(
            mision.id
        );


        console.log(
            `✅ Misión asignada a ${userId}: ${mision.name} (ID ${mision.id})`
        );
    }
}


// =========================================
// 🌎 GENERAR MISIONES PARA TODOS LOS USUARIOS
// =========================================

async function generarMisionesGlobales() {

    const usuarios = await db.query(
        `
        SELECT discord_id
        FROM users
        `
    );


    for (const usuario of usuarios.rows) {

        try {

            await generarMisiones(
                usuario.discord_id
            );

        } catch (error) {

            console.error(
                `❌ Error generando misiones para ${usuario.discord_id}:`,
                error
            );

        }
    }
}


// =========================================
// 📤 EXPORTAR
// =========================================

module.exports = {

    generarMisiones,

    generarMisionesGlobales

};