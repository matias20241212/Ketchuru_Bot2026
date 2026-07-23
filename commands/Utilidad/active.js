const db = require("../../database");

module.exports = {
    nombre: "active",

    async ejecutar(message) {

        const userId = message.author.id;

        try {

            const result = await db.query(`
                SELECT emoji, item, COUNT(*) AS usos
                FROM active_history
                WHERE discord_id = $1
                AND activated_at >= NOW() - INTERVAL '14 days'
                GROUP BY emoji, item
                ORDER BY usos DESC
                LIMIT 5
            `, [userId]);


            if (result.rows.length === 0) {
                return message.reply({
                    content: "⚡ No tienes objetos usados en los últimos 14 días.",
                    ephemeral: true
                });
            }


            let texto = `
⚡ **ACTIVIDAD DE PODERES**
━━━━━━━━━━━━━━━━━━

👤 Usuario:
${message.author}

📦 Objetos usados:
`;


            result.rows.forEach((obj, index) => {

                texto += `
${obj.emoji} **${obj.item}**
🔢 Usado: **${obj.usos} veces**
`;

            });


            texto += `
━━━━━━━━━━━━━━━━━━
📊 Espacios: **${result.rows.length}/5**

🗓️ Periodo:
Últimos 14 días
`;


            await message.reply({
                content: texto,
                ephemeral: true
            });


        } catch (error) {

            console.error(error);

            message.reply(
                "❌ Error al cargar tu actividad."
            );

        }

    }
};