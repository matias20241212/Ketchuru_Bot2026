function evaluarIntento(intento, palabra) {

    intento = intento.toUpperCase();
    palabra = palabra.toUpperCase();

    const resultado = Array(5).fill("gray");
    const usados = Array(5).fill(false);

    // VERDES
    for (let i = 0; i < 5; i++) {

        if (intento[i] === palabra[i]) {

            resultado[i] = "green";
            usados[i] = true;

        }

    }

    // AMARILLOS
    for (let i = 0; i < 5; i++) {

        if (resultado[i] === "green") {
            continue;
        }

        for (let j = 0; j < 5; j++) {

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

function crearFilaVisual(intento, resultado) {

    return intento
        .split("")
        .map((letra, i) => {

            if (resultado[i] === "green") {
                return `🟩${letra}`;
            }

            if (resultado[i] === "yellow") {
                return `🟨${letra}`;
            }

            return `⬛${letra}`;

        })
        .join("");

}

function crearTablero(intentos) {

    return intentos
        .map(intento =>
            crearFilaVisual(
                intento.palabra,
                intento.resultado
            )
        )
        .join("\n");

}

module.exports = {
    evaluarIntento,
    crearFilaVisual,
    crearTablero
};