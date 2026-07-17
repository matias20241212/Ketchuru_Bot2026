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


module.exports = {
    formatInventory,
    paginate
};