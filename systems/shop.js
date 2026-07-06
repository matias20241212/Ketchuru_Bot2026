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

  text += `┌────────────────┬────────────────┬────────────────┬────────────────┬────────────────┐\n`;

  for (let i = 0; i < 20; i++) {
    const item = shop[i];

    const line1 = `${item.price} 🪙`;
    const line2 = `${item.emoji}`;
    const line3 = `${item.rarity}`;

    const cell = `${line1}\n${line2}\n${line3}`;

    text += `│ ${cell.padEnd(14)} `;
    if ((i + 1) % 5 === 0) text += `│\n├────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤\n`;
  }

  return text;
}

module.exports = {
  restockShop,
  getShop,
  formatShop
};