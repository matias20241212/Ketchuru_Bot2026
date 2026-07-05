const fs = require("fs");
const path = require("path");

// =========================
// 📦 DATA FILE (SHOP GLOBAL)
// =========================
const shopFile = path.join(__dirname, "../data/shop.json");

let shop = { items: [] };
let lastRestock = Date.now();

// =========================
// 🧠 IMPORT TU DATA (50 ITEMS)
// =========================
const {
  common,
  uncommon,
  rare,
  epic,
  legendary,
  mythic,
  secret_bad,
  secret_medium,
  secret_big,
  og
} = require("./shopData");

// =========================
// 🎲 STOCK RULES
// =========================
function getStockByRarity(rarity) {
  switch (rarity) {
    case "common": return randomInt(1, 5);
    case "uncommon": return randomInt(1, 5);
    case "rare": return randomInt(1, 4);
    case "epic": return randomInt(2, 3);
    case "legendary": return randomInt(1, 3);
    case "mythic": return randomInt(1, 2);
    case "secret_bad": return 1;
    case "secret_medium": return 1;
    case "secret_big": return 1;
    case "og": return Math.random() < 0.3 ? randomInt(2, 3) : 1;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =========================
// 🔄 GENERAR SHOP
// =========================
function generateShop() {

  const pool = [
    ...common.map(x => ({ ...x, rarity: "common" })),
    ...uncommon.map(x => ({ ...x, rarity: "uncommon" })),
    ...rare.map(x => ({ ...x, rarity: "rare" })),
    ...epic.map(x => ({ ...x, rarity: "epic" })),
    ...legendary.map(x => ({ ...x, rarity: "legendary" })),
    ...mythic.map(x => ({ ...x, rarity: "mythic" })),
    ...secret_bad.map(x => ({ ...x, rarity: "secret_bad" })),
    ...secret_medium.map(x => ({ ...x, rarity: "secret_medium" })),
    ...secret_big.map(x => ({ ...x, rarity: "secret_big" })),
    ...og.map(x => ({ ...x, rarity: "og" }))
  ];

  // mezclar y tomar 50 items
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 50);

  shop = {
    items: shuffled.map(item => ({
      ...item,
      stock: getStockByRarity(item.rarity)
    })),
    createdAt: Date.now()
  };

  saveShop();
  lastRestock = Date.now();
}

// =========================
// 💾 GUARDAR SHOP GLOBAL
// =========================
function saveShop() {
  fs.writeFileSync(shopFile, JSON.stringify(shop, null, 2));
}

// =========================
// 📥 CARGAR SHOP
// =========================
function loadShop() {
  if (fs.existsSync(shopFile)) {
    try {
      shop = JSON.parse(fs.readFileSync(shopFile));
    } catch {
      shop = { items: [] };
    }
  }
}

// =========================
// ⏱️ RESTOCK AUTOMÁTICO
// =========================
function getRestockTime() {
  const day = new Date().getDay();

  if (day >= 1 && day <= 4) return 24 * 60 * 60 * 1000;
  if (day === 5 || day === 0) return 12 * 60 * 60 * 1000;
  if (day === 6) return 6 * 60 * 60 * 1000;
}

// check automático
setInterval(() => {
  const now = Date.now();
  const time = getRestockTime();

  if (now - lastRestock >= time) {
    generateShop();
  }
}, 60 * 1000);

// =========================
// 📦 INIT
// =========================
loadShop();
generateShop();

module.exports = {
  shop,
  generateShop,
  getRestockTime
};