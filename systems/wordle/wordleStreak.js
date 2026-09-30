// ============================================================
// 🔥 WORDLE STREAK
// ============================================================

function calcularRacha(stats, victoria) {

    const rachaAnterior =
        Number(stats?.racha || 0);

    const mejorAnterior =
        Number(stats?.mejor_racha || 0);

    let racha;

    if (victoria) {
        racha = rachaAnterior + 1;
    } else {
        racha = 0;
    }

    const mejorRacha =
        Math.max(
            mejorAnterior,
            racha
        );

    return {
        racha,
        mejorRacha
    };
}


// ============================================================
// 📤 EXPORTAR
// ============================================================

module.exports = {
    calcularRacha
};