function formatInventory(items) {

    if (!items || items.length === 0) {
        return "📦 Inventario vacío";
    }

    return items.map((item, index) => {

        return `${index + 1}. ${item.item} x${item.amount}`;

    }).join("\n");
}


function paginate(items, page = 0, perPage = 10) {

    const start = page * perPage;

    return items.slice(
        start,
        start + perPage
    );
}

const inventoryStates = new Map();

function setInventoryState(userId, state) {
    inventoryStates.set(userId, state);
}

function getInventoryState(userId) {
    return inventoryStates.get(userId);
}

module.exports = {
    createInventoryButtons,
    setInventoryState,
    getInventoryState
};