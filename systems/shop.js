const fs = require("fs");

let shop = { items: [], createdAt: Date.now() };

const shopFile = "./data/shop.json";

// =========================
// CARGAR SHOP
// =========================
if (fs.existsSync(shopFile)) {
    shop = JSON.parse(fs.readFileSync(shopFile));
}

// =========================
// GUARDAR SHOP
// =========================
function saveShop() {
    fs.writeFileSync(shopFile, JSON.stringify(shop, null, 2));
}

// =========================
// TIEMPO DE RESTOCK
// =========================
function getRestockTime() {
    const day = new Date().getDay();

    if (day >= 1 && day <= 4) return 24 * 60 * 60 * 1000;
    if (day === 5 || day === 0) return 12 * 60 * 60 * 1000;
    if (day === 6) return 6 * 60 * 60 * 1000;
}

// =========================
// GENERAR SHOP NUEVO
// =========================
function generateShop(allItems) {

    const items = [];

    for (let i = 0; i < 10; i++) {
        const item = allItems[Math.floor(Math.random() * allItems.length)];

        items.push({
            ...item,
            stock: Math.floor(Math.random() * 5) + 1 // base random
        });
    }

    shop = {
        items,
        createdAt: Date.now()
    };

    saveShop();
}

// =========================
// CHECK RESTOCK
// =========================
function checkRestock(allItems) {

    const now = Date.now();
    const time = getRestockTime();

    if (!shop.createdAt) {
        generateShop(allItems);
        return;
    }

    if (now - shop.createdAt >= time) {
        generateShop(allItems);
        console.log("🔄 SHOP RESTOCKEADO");
    }
}

module.exports = {
    shop,
    generateShop,
    checkRestock,
    getRestockTime,
    saveShop
};