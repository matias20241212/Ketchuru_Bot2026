function evaluarIntento(intento, palabra) {
    intento = intento.toUpperCase();
    palabra = palabra.toUpperCase();

    const longitud = palabra.length;

    const resultado = Array(longitud).fill("red");
    const usados = Array(longitud).fill(false);

    // 🟩 LETRAS CORRECTAS
    for (let i = 0; i < longitud; i++) {
        if (intento[i] === palabra[i]) {
            resultado[i] = "green";
            usados[i] = true;
        }
    }

    // 🟨 LETRAS EN OTRA POSICIÓN
    for (let i = 0; i < longitud; i++) {
        if (resultado[i] === "green") continue;

        for (let j = 0; j < longitud; j++) {
            if (
                !usados[j] &&
                intento[i] === palabra[j]
            ) {
                resultado[i] = "yellow";
                usados[j] = true;
                break;
            }
        }
    }

    return resultado;
}


// ============================================================
// 🔤 LETRAS COMPACTAS
// ============================================================

const letrasPequenas = {
    A: "ᴀ",
    B: "ʙ",
    C: "ᴄ",
    D: "ᴅ",
    E: "ᴇ",
    F: "ꜰ",
    G: "ɢ",
    H: "ʜ",
    I: "ɪ",
    J: "ᴊ",
    K: "ᴋ",
    L: "ʟ",
    M: "ᴍ",
    N: "ɴ",
    O: "ᴏ",
    P: "ᴘ",
    Q: "ǫ",
    R: "ʀ",
    S: "s",
    T: "ᴛ",
    U: "ᴜ",
    V: "ᴠ",
    W: "ᴡ",
    X: "x",
    Y: "ʏ",
    Z: "ᴢ",
    Ñ: "ɴ"
};

function letraPequena(letra) {
    const mayuscula = letra.toUpperCase();

    return letrasPequenas[mayuscula] || letra.toLowerCase();
}


// ============================================================
// 🎨 FILA VISUAL
// ============================================================

function crearFilaVisual(intento, resultado) {
    return intento
        .split("")
        .map((letra, i) => {

            const pequena = letraPequena(letra);

            if (resultado[i] === "green") {
                return `🟩${pequena}`;
            }

            if (resultado[i] === "yellow") {
                return `🟨${pequena}`;
            }

            return `🟥${pequena}`;
        })
        .join("");
}


// ============================================================
// 📋 TABLERO
// ============================================================

function crearTablero(intentos) {
    return intentos
        .map((intento, i) =>
            `${i + 1}° intento: ${crearFilaVisual(
                intento.palabra,
                intento.resultado
            )}`
        )
        .join("\n");
}


module.exports = {
    evaluarIntento,
    crearFilaVisual,
    crearTablero
};