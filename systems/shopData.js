// =========================
// 🛒 SHOP DATA (ITEMS BASE)
// =========================


// =========================
// 1️⃣ COMMON
// =========================
const common = [
{ emoji: "🍎", price: 80, effect: "+1 mensaje bonus al azar" },
{ emoji: "🍏", price: 70, effect: "+5% coins en mensajes" },
{ emoji: "🍇", price: 90, effect: "reduce cooldown comandos -1s" },
{ emoji: "🍉", price: 60, effect: "+10 coins cada 20 mensajes" },
{ emoji: "🍓", price: 100, effect: "doble recompensa pequeña probabilidad" },

{ emoji: "🍌", price: 75, effect: "+3 coins cada 10 mensajes" },
{ emoji: "🥥", price: 85, effect: "+10% duración de boosts" },
{ emoji: "🥭", price: 95, effect: "reduce cooldown comandos -2s" },
{ emoji: "🥨", price: 120, effect: "+15 coins al azar" },
{ emoji: "🍪", price: 130, effect: "pequeña regeneración de coins" }
];


// =========================
// 2️⃣ UNCOMMON
// =========================
const uncommon = [
{ emoji: "🍒", price: 200, effect: "+50 coins instantáneo" },
{ emoji: "🍍", price: 300, effect: "x1.2 coins por 10 min" },
{ emoji: "🥝", price: 250, effect: "anti pérdida 1 vez" },
{ emoji: "🍑", price: 350, effect: "+100 coins daily bonus" },
{ emoji: "🍋", price: 180, effect: "+5% drop rate en shop" },

{ emoji: "🫐", price: 280, effect: "+150 coins instantáneo" },
{ emoji: "🍈", price: 320, effect: "x1.3 coins por 10 min" },
{ emoji: "🥤", price: 400, effect: "+10% luck temporal" },
{ emoji: "🍯", price: 450, effect: "reduce cooldown tienda" },
{ emoji: "🥜", price: 220, effect: "protección de pérdida pequeña" }
];


// =========================
// 3️⃣ RARE
// =========================
const rare = [
{ emoji: "🍊", price: 600, effect: "x2 coins 5 min" },
{ emoji: "🥑", price: 800, effect: "protección inventario 1h" },
{ emoji: "🌽", price: 700, effect: "+200 coins" },
{ emoji: "🥕", price: 500, effect: "reduce cooldown shop" },
{ emoji: "🧅", price: 900, effect: "chance doble item compra" },

{ emoji: "🔮", price: 1000, effect: "luck boost 10 min" },
{ emoji: "🧪", price: 1200, effect: "duplica una recompensa" },
{ emoji: "🛡️", price: 1500, effect: "protección inventario 2h" },
{ emoji: "⚔️", price: 1300, effect: "+30% recompensas" },
{ emoji: "🪄", price: 1800, effect: "reduce cooldown global" }
];


// =========================
// 4️⃣ EPIC
// =========================
const epic = [
{ emoji: "🔥", price: 1500, effect: "x2 coins 15 min" },
{ emoji: "⚡", price: 2000, effect: "doble recompensa mensajes" },
{ emoji: "🌈", price: 2500, effect: "luck boost shop" },
{ emoji: "🌶️", price: 1800, effect: "anti robo 1h" },
{ emoji: "🧄", price: 1600, effect: "regen coins pasivo" },

{ emoji: "🌋", price: 3000, effect: "x3 coins 10 min" },
{ emoji: "🌊", price: 2800, effect: "doble recompensa mensajes 15 min" },
{ emoji: "🌙", price: 3500, effect: "luck boost fuerte" },
{ emoji: "🌀", price: 4000, effect: "random boost x2/x4" },
{ emoji: "☀️", price: 3200, effect: "regeneración coins rápida" }
];


// =========================
// 5️⃣ LEGENDARY
// =========================
const legendary = [
{ emoji: "🍔", price: 5000, effect: "x3 coins 10 min" },
{ emoji: "🍕", price: 7000, effect: "recupera coins perdidas" },
{ emoji: "🌭", price: 6000, effect: "shop discount -20%" },
{ emoji: "🍟", price: 4500, effect: "daily reward x2" },
{ emoji: "🍗", price: 8000, effect: "luck extremo shop" },

{ emoji: "🚀", price: 10000, effect: "x4 coins 15 min" },
{ emoji: "🦁", price: 12000, effect: "luck legendaria shop" },
{ emoji: "🐉", price: 15000, effect: "boost extremo temporal" },
{ emoji: "🪙", price: 9000, effect: "duplica ganancias" },
{ emoji: "🎁", price: 11000, effect: "recompensa sorpresa legendaria" }
];


// =========================
// 6️⃣ MYTHIC
// =========================
const mythic = [
{ emoji: "🍰", price: 20000, effect: "x5 coins 10 min" },
{ emoji: "🧁", price: 15000, effect: "daily x2 automático" },
{ emoji: "🍫", price: 30000, effect: "protección total 1h" },
{ emoji: "🍩", price: 25000, effect: "chance OG item" },
{ emoji: "🍪", price: 18000, effect: "coin regen alto" },

{ emoji: "🪽", price: 40000, effect: "x6 coins 15 min" },
{ emoji: "🌠", price: 50000, effect: "luck mythic shop" },
{ emoji: "🔱", price: 60000, effect: "todos los boosts +10 min" },
{ emoji: "🗿", price: 45000, effect: "protección total 2h" },
{ emoji: "🌺", price: 35000, effect: "regen coins extremo" }
];


// =========================
// 7️⃣ SECRET BAD
// =========================
const secret_bad = [
{ emoji: "💀", price: 5000, effect: "-30% coins random" },
{ emoji: "☠️", price: 8000, effect: "pierdes 10-20% coins" },
{ emoji: "👻", price: 3000, effect: "sin efecto (troll)" },
{ emoji: "🕷️", price: 4500, effect: "reduce luck temporal" },
{ emoji: "🪲", price: 6000, effect: "doble cooldown" },

{ emoji: "🩸", price: 9000, effect: "pierdes 5% coins" },
{ emoji: "🧟", price: 12000, effect: "reduce rewards temporal" },
{ emoji: "🦴", price: 7000, effect: "efecto negativo random" },
{ emoji: "🕸️", price: 10000, effect: "aumenta cooldown" },
{ emoji: "🥀", price: 6000, effect: "bloquea bonus pequeño" }
];


// =========================
// 8️⃣ SECRET MEDIUM
// =========================
const secret_medium = [
{ emoji: "🌪️", price: 20000, effect: "x4 coins 5 min" },
{ emoji: "🧊", price: 30000, effect: "freeze cooldown 10 min" },
{ emoji: "🌑", price: 50000, effect: "protección total steal" },
{ emoji: "🌫️", price: 25000, effect: "random boost x2/x3" },
{ emoji: "🪐", price: 40000, effect: "reroll shop gratis" },

{ emoji: "🌘", price: 80000, effect: "protección steal 30 min" },
{ emoji: "🧬", price: 90000, effect: "boost aleatorio poderoso" },
{ emoji: "🛸", price: 100000, effect: "reroll tienda avanzado" },
{ emoji: "🌋", price: 70000, effect: "x5 coins 10 min" },
{ emoji: "🌀", price: 75000, effect: "luck x5 temporal" }
];


// =========================
// 9️⃣ SECRET BIG
// =========================
const secret_big = [
{ emoji: "⚡", price: 150000, effect: "x10 coins 10 min" },
{ emoji: "🌟", price: 300000, effect: "doble shop rare items" },
{ emoji: "🔥", price: 250000, effect: "auto win mini juegos" },
{ emoji: "💫", price: 400000, effect: "luck max 30 min" },
{ emoji: "🌌", price: 500000, effect: "protección total + bonus" },

{ emoji: "🌞", price: 700000, effect: "x15 coins 10 min" },
{ emoji: "🌠", price: 900000, effect: "luck máximo 1h" },
{ emoji: "🪐", price: 800000, effect: "doble rareza tienda" },
{ emoji: "🔱", price: 1000000, effect: "todos los boosts activos" },
{ emoji: "🧿", price: 1200000, effect: "protección absoluta" }
];


// =========================
// 🔟 OG
// =========================
const og = [
{ emoji: "👑", price: 2500000, effect: "x20 coins 10 min" },
{ emoji: "🏆", price: 3000000, effect: "todos los boosts activos" },
{ emoji: "🎯", price: 4000000, effect: "100% luck shop 10 min" },
{ emoji: "🧿", price: 5000000, effect: "inmunidad economía 1h" },
{ emoji: "💎", price: 15000000, effect: "x100 coins + reset luck" },

{ emoji: "🐲", price: 8000000, effect: "x50 coins 10 min" },
{ emoji: "👁️", price: 10000000, effect: "visión tienda secreta" },
{ emoji: "🌍", price: 12000000, effect: "todos los efectos activos" },
{ emoji: "🕳️", price: 15000000, effect: "boost infinito pequeño tiempo" },
{ emoji: "✨", price: 20000000, effect: "objeto único OG" }
];


module.exports = {
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
};