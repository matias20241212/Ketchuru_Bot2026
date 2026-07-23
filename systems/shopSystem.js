const fs = require("fs");
const path = require("path");

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

const multiplierFile = path.join(__dirname, "../data/multiplier.json");


function loadMultiplier() {

  if (!fs.existsSync(multiplierFile)) return 1;


  const data = JSON.parse(
    fs.readFileSync(multiplierFile)
  );


  return data.level || 1;

}



// =========================
// 🎲 PROBABILIDADES BASE
// =========================

const baseRarities = [

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



function getRarities() {


  const level = loadMultiplier();


  const rarities = baseRarities.map(r => ({
    ...r
  }));



  // 🍀 MULTIPLICADOR DE TIENDA

  const multiplierTable = {

    1: 1,
    2: 3.5,
    3: 6,
    4: 8.5,
    5: 11,
    6: 13.5,
    7: 16,
    8: 18.5,
    9: 21,
    10: 24,
    11: 27,
    12: 30,
    13: 32,
    14: 34,
    15: 35

  };



  const boost = multiplierTable[level] || 1;



  // Aumentar rarezas altas

  for (const r of rarities) {


    if (

      r.name === "legendary" ||

      r.name === "mythic" ||

      r.name.includes("secret")

    ) {

      r.chance *= boost;

    }

  }



  // 👑 BONUS OG

  if (level > 1) {


    const ogBonus = (level / 15) * 7.5;


    const ogRarity =
      rarities.find(r => r.name === "og");


    ogRarity.chance += ogBonus;

  }



  return rarities;

}




function random(arr) {

  return arr[
    Math.floor(Math.random() * arr.length)
  ];

}




function roll() {


  const rarities = getRarities();


  const total =
    rarities.reduce(
      (sum, r) => sum + r.chance,
      0
    );



  const r = Math.random() * total;


  let acc = 0;



  for (const x of rarities) {


    acc += x.chance;


    if (r <= acc) {

      return x;

    }

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


    const item = random(
      rarity.pool
    );



    shop.push({

      id: `${rarity.name}_${i}_${Date.now()}`,

      emoji: item.emoji,

      price: item.price,

      rarity: rarity.name,

      effect: item.effect

    });


  }



  return shop;

}





module.exports = {

  generateShop

};