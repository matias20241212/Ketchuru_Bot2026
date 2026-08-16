// ============================================================
// 🎪 FERIA - STOCK
// ============================================================

let feriaStock = [];

// ============================================================
// 🎪 GENERAR NUEVO STOCK
// ============================================================

function generarStock() {

    // Lista de objetos de la Feria
    feriaStock = [
        {
            emoji: "🍩",
            nombre: "Rosquilla",
            precio: 25000
        },
        {
            emoji: "🍕",
            nombre: "Pizza",
            precio: 50000
        },
        {
            emoji: "🍔",
            nombre: "Hamburguesa",
            precio: 75000
        },
        {
            emoji: "🍟",
            nombre: "Papas",
            precio: 10000
        },
        {
            emoji: "🍫",
            nombre: "Chocolate",
            precio: 30000
        }
    ];

    // Mezclar el stock
    feriaStock.sort(
        () => Math.random() - 0.5
    );

    console.log(
        "🎪 Stock de Feria generado:",
        feriaStock
    );

    return feriaStock;
}

// ============================================================
// 🎪 OBTENER STOCK ACTUAL
// ============================================================

function obtenerStock() {

    return feriaStock;

}

// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {
    generarStock,
    obtenerStock
};