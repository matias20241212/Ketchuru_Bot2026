// ============================================================
// 💰 WORDLE REWARDS
// ============================================================

const db = require("../../database");


// ============================================================
// 🏆 CALCULAR RECOMPENSA
// ============================================================

function calcularRecompensa(intentos) {

    const recompensas = {
        1: 100000,
        2: 50000,
        3: 25000,
        4: 20000,
        5: 10000,
        6: 10000
    };

    return recompensas[intentos] || 0;
}


// ============================================================
// 💰 DAR RECOMPENSA
// ============================================================

async function darRecompensa(
    userId,
    cantidad
) {

    if (!cantidad || cantidad <= 0) {
        return 0;
    }

    let result = await db.query(
        `
        SELECT balance
        FROM users
        WHERE discord_id = $1
        `,
        [userId]
    );

    // Crear cuenta si no existe
    if (result.rows.length === 0) {

        await db.query(
            `
            INSERT INTO users (
                discord_id,
                balance
            )
            VALUES ($1, $2)
            `,
            [userId, 50]
        );

        result = await db.query(
            `
            SELECT balance
            FROM users
            WHERE discord_id = $1
            `,
            [userId]
        );
    }

    const balanceActual =
        Number(result.rows[0].balance);

    const nuevoBalance =
        balanceActual + cantidad;

    await db.query(
        `
        UPDATE users
        SET balance = $1
        WHERE discord_id = $2
        `,
        [
            nuevoBalance,
            userId
        ]
    );

    return nuevoBalance;
}


// ============================================================
// 📤 EXPORTAR
// ============================================================

module.exports = {
    calcularRecompensa,
    darRecompensa
};