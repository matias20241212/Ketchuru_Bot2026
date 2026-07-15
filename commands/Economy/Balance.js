const db = require("../../database");

module.exports = {
    name: "balance",

    async execute(message) {
        const userId = message.author.id;

        try {
            // Buscar usuario en Neon
            const result = await db.query(
                "SELECT balance FROM users WHERE discord_id = $1",
                [userId]
            );

            // Si no existe, crearlo con 50 monedas
            if (result.rows.length === 0) {
                await db.query(
                    "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                    [userId, 50]
                );

                return message.reply(`💰 Tienes **50 monedas**`);
            }

            const money = result.rows[0].balance;

            message.reply(`💰 Tienes **${money} monedas**`);

        } catch (error) {
            console.error("Error en balance Neon:", error);
            message.reply("❌ Hubo un error al obtener tu balance.");
        }
    }
};