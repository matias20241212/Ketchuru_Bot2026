const { addItem } = require("../../systems/inventory");
const { shop } = require("../../systems/shop");

let balances = require("../../data/balance.json");

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
        // ❌ SIN MONEDAS
        // =========================
        const userBalance = balances[userId] || 0;

        if (userBalance < item.price) {
            return message.reply(`❌ No tienes las suficientes monedas para comprar ${item.emoji}`);
        }

        // =========================
        // ✔ COMPRA EXITOSA
        // =========================
        balances[userId] -= item.price;

        item.stock -= 1;

        addItem(userId, item.emoji, 1);

        return message.reply("✔ Comprado !");
    }
};