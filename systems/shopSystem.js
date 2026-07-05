const data = require("../data/shopData");

const rarityChances = [
  { rarity: "common", chance: 55 },
  { rarity: "uncommon", chance: 45 },
  { rarity: "epic", chance: 35 },
  { rarity: "legendary", chance: 27.5 },
  { rarity: "mythic", chance: 20 },
  { rarity: "secret_bad", chance: 12.5 },
  { rarity: "secret_medium", chance: 7.5 },
  { rarity: "secret_big", chance: 2.5 },
  { rarity: "og", chance: 0.05 }
];

function getRandomRarity() {
  const roll = Math.random() * 100;
  let acc = 0;

  for (const r of rarityChances) {
    acc += r.chance;
    if (roll <= acc) return r.rarity;
  }

  return "common";
}

function getItem(rarity) {
  const pool = data[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateShop() {
  const items = [];

  for (let i = 0; i < 20; i++) {
    const rarity = getRandomRarity();
    const item = getItem(rarity);

    if (item) items.push({ ...item, rarity });
  }

  return items;
}

module.exports = { generateShop };