const { shop } = require("../../systems/shop");

module.exports = {
    name: "shop",

    execute(message) {

        let text = "🛒 **TIENDA KETCHURU**\n\n";

        for (const item of shop.items) {
            text += `${item.emoji} | ${item.price} 🪙 | Stock: ${item.stock}\n`;
        }

        return message.reply(text);
    }
};