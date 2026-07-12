const { addItem } = require("../../systems/inventory");
const { shop } = require("../../systems/shop");

const fs = require("fs");
const path = require("path");

const balanceFile = path.join(__dirname, "../../data/balance.json");
let balances = fs.existsSync(balanceFile)
  ? JSON.parse(fs.readFileSync(balanceFile))
  : {};

function saveBalances() {
  fs.writeFileSync(balanceFile, JSON.stringify(balances, null, 2));
}

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
        saveBalances();

        item.stock -= 1;

        addItem(userId, item.emoji, 1);

        return message.reply("✔ Comprado !");
    }
};