// ============================================================
// 🟩 WORDLE COMMAND
// ============================================================

const wordleManager =
    require("../../systems/wordle/wordleManager");


// ============================================================
// 🔍 BUSCAR FUNCIÓN DEL MANAGER
// ============================================================

function buscarFuncion(...nombres) {

    for (const nombre of nombres) {

        if (
            typeof wordleManager[nombre] ===
            "function"
        ) {

            return wordleManager[nombre];

        }

    }

    return null;

}


// ============================================================
// !WORDLE
// ============================================================

async function ejecutar(
    message,
    args,
    db
) {

    try {

        const userId =
            message.author.id;

        const palabra =
            args
                .join(" ")
                .trim();

        // ----------------------------------------------------
        // 🔎 BUSCAR FUNCIÓN PRINCIPAL
        // ----------------------------------------------------

        const funcion =
            buscarFuncion(
                "ejecutar",
                "jugar",
                "iniciar",
                "iniciarJuego",
                "crearJuego",
                "handleWordle"
            );

        if (
            !funcion
        ) {

            console.error(
                "❌ No se encontró una función compatible en wordleManager.js"
            );

            console.error(
                "📦 Exportaciones encontradas:",
                Object.keys(wordleManager)
            );

            return message.reply(
                "❌ El sistema de Wordle no está conectado correctamente."
            );

        }

        return await funcion(
            message,
            palabra,
            userId,
            db
        );

    } catch (error) {

        console.error(
            "❌ ERROR EN !WORDLE:",
            error
        );

        return message.reply(
            "❌ Ocurrió un error con Wordle."
        );

    }

}


// ============================================================
// /WORDLE
// ============================================================

async function execute(
    interaction,
    db
) {

    try {

        const userId =
            interaction.user.id;

        const palabra =
            interaction.options.getString(
                "palabra"
            ) || "";

        // ----------------------------------------------------
        // 🔎 BUSCAR FUNCIÓN PRINCIPAL
        // ----------------------------------------------------

        const funcion =
            buscarFuncion(
                "ejecutar",
                "jugar",
                "iniciar",
                "iniciarJuego",
                "crearJuego",
                "handleWordle"
            );

        if (
            !funcion
        ) {

            console.error(
                "❌ No se encontró una función compatible en wordleManager.js"
            );

            console.error(
                "📦 Exportaciones encontradas:",
                Object.keys(wordleManager)
            );

            return interaction.reply(
                {
                    content:
                        "❌ El sistema de Wordle no está conectado correctamente.",
                    ephemeral:
                        true
                }
            );

        }

        return await funcion(
            interaction,
            palabra,
            userId,
            db
        );

    } catch (error) {

        console.error(
            "❌ ERROR EN /WORDLE:",
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            return interaction.reply(
                {
                    content:
                        "❌ Ocurrió un error con Wordle.",
                    ephemeral:
                        true
                }
            );

        }

    }

}


// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {

    nombre:
        "wordle",

    name:
        "wordle",

    ejecutar,

    execute,

    // ========================================================
    // 🔵 SLASH COMMAND
    // ========================================================

    data: {

        name:
            "wordle",

        description:
            "Juega Wordle",

        options: [

            {

                type: 3,

                name:
                    "palabra",

                description:
                    "Tu intento de Wordle",

                required:
                    false

            }

        ]

    }

};