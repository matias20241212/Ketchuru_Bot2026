const fs = require("fs");

let inventory = {};
const inventoryFile = "./data/inventory.json";

function saveInventory() {
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));
}

// cargar inventario
if (fs.existsSync(inventoryFile)) {
    inventory = JSON.parse(fs.readFileSync(inventoryFile));
}

// funciones
function addItem(userId, item, amount = 1) {
    if (!inventory[userId]) inventory[userId] = {};
    inventory[userId][item] = (inventory[userId][item] || 0) + amount;
    saveInventory();
}

function removeItem(userId, item, amount = 1) {
    if (!inventory[userId]) return false;
    if (!inventory[userId][item]) return false;

    inventory[userId][item] -= amount;

    if (inventory[userId][item] <= 0) {
        delete inventory[userId][item];
    }

    saveInventory();
}

module.exports = {
    inventory,
    addItem,
    removeItem
};