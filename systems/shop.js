const { generateShop } = require("./shopSystem");

let currentShop = [];

function restockShop() {
    currentShop = generateShop();
}

function getShop() {
    return currentShop;
}


// =========================
// 🧱 FORMATO 5x4
// =========================

function formatShop() {

    const shop = currentShop;

    let text = `🛒 KETCHURU SHOP\n\n`;

    text += "```txt\n";
    text += "┌────────────────┬────────────────┬────────────────┬────────────────┬────────────────┐\n";


    for (let i = 0; i < 20; i++) {

        const item = shop[i] || {
            price: 0,
            emoji: "❓",
            rarity: "Empty"
        };


        const cell = `${item.emoji} ${item.price}🪙 ${item.rarity}`;

        text += `│ ${cell.padEnd(14)} `;


        if ((i + 1) % 5 === 0) {

            text += "│\n";


            if (i !== 19) {
                text += "├────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤\n";
            }

        }

    }


    text += "└────────────────┴────────────────┴────────────────┴────────────────┴────────────────┘\n";
    text += "```";


    return text;
}


module.exports = {
    restockShop,
    getShop,
    formatShop
};