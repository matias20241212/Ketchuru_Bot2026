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
// 🎲 PROBABILIDADES
// =========================

const rarities = [
  { name: "common", pool: common, chance: 55 },
  { name: "uncommon", pool: uncommon, chance: 20 },
  { name: "rare", pool: rare, chance: 10 },
  { name: "epic", pool: epic, chance: 6 },
  { name: "legendary", pool: legendary, chance: 4 },
  { name: "mythic", pool: mythic, chance: 2.5 },
  { name: "secret_bad", pool: secret_bad, chance: 1.2 },
  { name: "secret_medium", pool: secret_medium, chance: 0.8 },
  { name: "secret_big", pool: secret_big, chance: 0.45 },
  { name: "og", pool: og, chance: 0.05 }
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roll() {
  const r = Math.random() * 100;
  let acc = 0;

  for (const x of rarities) {
    acc += x.chance;
    if (r <= acc) return x;
  }

  return rarities[0];
}

// =========================
// 🛒 GENERAR TIENDA 5x4
// =========================

function generateShop() {
  const shop = [];

  for (let i = 0; i < 20; i++) {
    const rarity = roll();
    const item = random(rarity.pool);

    shop.push({
      emoji: item.emoji,
      price: item.price,
      rarity: rarity.name,
      effect: item.effect
    });
  }

  return shop;
}

module.exports = { generateShop };