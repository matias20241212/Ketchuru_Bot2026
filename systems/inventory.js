const fs = require("fs");
const path = require("path");

const inventoryFile = path.join(__dirname, "../data/inventory.json");

function loadInventory() {
    if (!fs.existsSync(inventoryFile)) {
        fs.writeFileSync(inventoryFile, "{}");
    }

    return JSON.parse(
        fs.readFileSync(inventoryFile)
    );
}

function saveInventory(data) {
    fs.writeFileSync(
        inventoryFile,
        JSON.stringify(data, null, 2)
    );
}


// Añadir objeto
function addItem(userId, item, amount = 1) {

    const inventories = loadInventory();

    if (!inventories[userId]) {
        inventories[userId] = {};
    }

    if (!inventories[userId][item]) {
        inventories[userId][item] = 0;
    }

    inventories[userId][item] += amount;

    saveInventory(inventories);
}


// Quitar objeto
function removeItem(userId, item, amount = 1) {

    const inventories = loadInventory();

    if (!inventories[userId]) return false;

    if (!inventories[userId][item]) return false;


    inventories[userId][item] -= amount;


    if (inventories[userId][item] <= 0) {
        delete inventories[userId][item];
    }


    saveInventory(inventories);

    return true;
}


// Obtener inventario
function getInventory(userId) {

    const inventories = loadInventory();

    return inventories[userId] || {};

}


module.exports = {
    addItem,
    removeItem,
    getInventory
};