const { addItem } = require("../../systems/inventory");
const { shop } = require("../../systems/shop");
const db = require("../../database");

module.exports = {
    name: "buy",

    async execute(message, args) {

        const userId = message.author.id;

        if (!args[0]) {
            return message.reply("❌ Debes especificar un item. Ej: !buy 🍎");
        }

        const emoji = args[0];

        const item = shop.items.find(i => i.emoji === emoji);

        if (!item) {
            return message.reply("❌ Este item no existe en la tienda.");
        }


        // =========================
        // ❌ SIN STOCK
        // =========================
        if (item.stock <= 0) {
            return message.reply("❌ Este poder no tiene Stock");
        }


        // =========================
        // 💰 BALANCE DESDE NEON
        // =========================

        let result = await db.query(
            "SELECT balance FROM users WHERE discord_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {

            await db.query(
                "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                [userId, 50]
            );

            result = await db.query(
                "SELECT balance FROM users WHERE discord_id = $1",
                [userId]
            );
        }


        let userBalance = Number(result.rows[0].balance);


        if (userBalance < item.price) {
            return message.reply(`❌ No tienes las suficientes monedas para comprar ${item.emoji}`);
        }



        // =========================
        // ✔ COMPRA EXITOSA
        // =========================

        userBalance -= item.price;


        await db.query(
            "UPDATE users SET balance = $1 WHERE discord_id = $2",
            [userBalance, userId]
        );


        item.stock -= 1;


        addItem(userId, item.emoji, 1);


        return message.reply("✔ Comprado !");
    }
};