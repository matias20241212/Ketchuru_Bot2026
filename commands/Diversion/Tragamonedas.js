const db = require("../../database");
const fs = require("fs");
const { avanzarMision } = require("../../systems/missionProgress");

const tragamonedasMultiplierFile =
    "./data/tragamonedasMultiplier.json";

// =====================================================
// 🎰 MULTIPLICADOR
// =====================================================

function loadTragamonedasMultiplier() {

    if (!fs.existsSync(tragamonedasMultiplierFile))
        return 1;

    try {

        const data = JSON.parse(
            fs.readFileSync(tragamonedasMultiplierFile)
        );

        return data.level || 1;

    } catch {

        return 1;

    }

}

// =====================================================
// ⏳ SLEEP
// =====================================================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}

// =====================================================
// 🎰 SÍMBOLOS
// =====================================================

const emojis = [

    { emoji: "❤️", chance: 30 },
    { emoji: "🦈", chance: 22 },
    { emoji: "🍀", chance: 18 },
    { emoji: "🍒", chance: 12 },
    { emoji: "🔥", chance: 8 },
    { emoji: "🍇", chance: 6 },
    { emoji: "🍍", chance: 3 },
    { emoji: "💎", chance: 1 }

];

function randomEmoji() {

    const total =
        emojis.reduce(
            (a, b) => a + b.chance,
            0
        );

    let random =
        Math.random() * total;

    for (const item of emojis) {

        random -= item.chance;

        if (random <= 0)
            return item.emoji;

    }

    return "❤️";

}

// =====================================================
// 💰 FORMATO DE NÚMEROS
// =====================================================

function formatearNumero(numero) {

    if (numero >= 1e30)
        return (numero / 1e30).toFixed(2).replace(/\.00$/, "") + "DC";

    if (numero >= 1e27)
        return (numero / 1e27).toFixed(2).replace(/\.00$/, "") + "No";

    if (numero >= 1e24)
        return (numero / 1e24).toFixed(2).replace(/\.00$/, "") + "Oc";

    if (numero >= 1e21)
        return (numero / 1e21).toFixed(2).replace(/\.00$/, "") + "Sx";

    if (numero >= 1e18)
        return (numero / 1e18).toFixed(2).replace(/\.00$/, "") + "Qi";

    if (numero >= 1e15)
        return (numero / 1e15).toFixed(2).replace(/\.00$/, "") + "Qa";

    if (numero >= 1e12)
        return (numero / 1e12).toFixed(2).replace(/\.00$/, "") + "T";

    if (numero >= 1e9)
        return (numero / 1e9).toFixed(2).replace(/\.00$/, "") + "B";

    if (numero >= 1e6)
        return (numero / 1e6).toFixed(2).replace(/\.00$/, "") + "M";

    if (numero >= 1e3)
        return (numero / 1e3).toFixed(2).replace(/\.00$/, "") + "K";

    return numero.toLocaleString();

}

// =====================================================
// 🔢 CONVERTIR CANTIDAD
// =====================================================

function convertirCantidad(valor) {

    if (!valor)
        return null;

    valor = valor
        .toString()
        .trim()
        .toUpperCase()
        .replace(/,/g, "");

    const match = valor.match(
        /^(\d+(?:\.\d+)?)(K|M|B|T|QA|QI|SX|OC|NO|DC)?$/
    );

    if (!match)
        return null;

    const numero = Number(match[1]);

    if (!Number.isFinite(numero))
        return null;

    const unidad = match[2] || "";

    const multiplicadores = {

        K: 1e3,
        M: 1e6,
        B: 1e9,
        T: 1e12,
        QA: 1e15,
        QI: 1e18,
        SX: 1e21,
        OC: 1e24,
        NO: 1e27,
        DC: 1e30

    };

    return Math.floor(
        numero * (multiplicadores[unidad] || 1)
    );

}

// =====================================================
// 🎰 DIFICULTAD PROGRESIVA
// =====================================================

function obtenerDificultad(apuesta) {

    if (apuesta < 100_000) {

        return {
            nombre: "Muy fácil",
            emoji: "🟢",
            penalty: 0
        };

    }

    if (apuesta < 10_000_000) {

        return {
            nombre: "Fácil",
            emoji: "🟡",
            penalty: 0.025
        };

    }

    if (apuesta < 1_000_000_000) {

        return {
            nombre: "Normal",
            emoji: "🟠",
            penalty: 0.05
        };

    }

    // B = -5%
    if (apuesta < 1e12) {

        return {
            nombre: "Difícil",
            emoji: "🔴",
            penalty: 0.05
        };

    }

    // T = -7.5%
    if (apuesta < 1e15) {

        return {
            nombre: "Muy difícil",
            emoji: "🟣",
            penalty: 0.075
        };

    }

    // Qa = -12.5%
    if (apuesta < 1e18) {

        return {
            nombre: "Extrema",
            emoji: "🔵",
            penalty: 0.125
        };

    }

    // Qi = -15%
    if (apuesta < 1e21) {

        return {
            nombre: "Brutal",
            emoji: "🟤",
            penalty: 0.15
        };

    }

    // Sx = -20%
    if (apuesta < 1e24) {

        return {
            nombre: "Infernal",
            emoji: "⚫",
            penalty: 0.20
        };

    }

    // Oc = -25%
    if (apuesta < 1e27) {

        return {
            nombre: "Demencial",
            emoji: "☠️",
            penalty: 0.25
        };

    }

    // No = -30%
    if (apuesta < 1e30) {

        return {
            nombre: "Casi imposible",
            emoji: "💀",
            penalty: 0.30
        };

    }

    // DC = -40%
    return {

        nombre: "Máxima",
        emoji: "👑",
        penalty: 0.40

    };

}

// =====================================================
// 🎰 APUESTAS RÁPIDAS
// =====================================================

const apuestasRapidas = [

    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,

    250,
    300,
    500,
    750,

    1000,
    1500,
    2000,
    2500,
    3000,
    4000,
    5000,
    6000,
    7000,
    8000,
    9000,
    10000,

    25000,
    50000,

    100_000,
    250_000,
    500_000,

    1_000_000,
    2_000_000,
    3_000_000,
    4_000_000,
    5_000_000,
    6_000_000,
    7_000_000,
    8_000_000,
    9_000_000,
    10_000_000,

    25_000_000,
    50_000_000,
    100_000_000,
    250_000_000,
    500_000_000,

    1_000_000_000,
    5_000_000_000,
    25_000_000_000,
    50_000_000_000,
    100_000_000_000

];

// =====================================================
// 🎰 COMANDO
// =====================================================

module.exports = {

    nombre: "tragamonedas",

    async ejecutar(message, args) {

        const userId = message.author.id;

        let result = await db.query(
            `
            SELECT balance
            FROM users
            WHERE discord_id=$1
            `,
            [userId]
        );

        if (result.rows.length === 0) {

            await db.query(
                `
                INSERT INTO users
                (
                    discord_id,
                    balance
                )
                VALUES
                ($1,$2)
                `,
                [userId, 50]
            );

            result = await db.query(
                `
                SELECT balance
                FROM users
                WHERE discord_id=$1
                `,
                [userId]
            );

        }

        let balance =
            Number(result.rows[0].balance);

        // =================================================
        // ❌ SIN ARGUMENTO
        // =================================================

        if (!args[0]) {

            return message.reply(
                `
🎰 **TRAGAMONEDAS**

Uso:

\`!tragamonedas 1000\`
\`!tragamonedas 50M\`
\`!tragamonedas 1B\`
\`!tragamonedas 5Qa\`
\`!tragamonedas 1DC\`

También:

\`!tragamonedas 50%\`
→ Apuesta el 50% de tu balance.
→ 50% ganar / 50% perder.

\`!tragamonedas All\`
→ Apuesta todo.
→ 25% ganar / 75% perder.

💰 Balance:
**${formatearNumero(balance)}**
                `
            );

        }

        // =================================================
        // 🎯 DETERMINAR APUESTA
        // =================================================

        let bet;
        let modoEspecial = null;

        // ALL
        if (
            args[0].toUpperCase() === "ALL"
        ) {

            if (balance <= 0)
                return message.reply(
                    "❌ No tienes monedas."
                );

            bet = balance;
            modoEspecial = "ALL";

        }

        // PORCENTAJE
        else if (
            args[0].endsWith("%")
        ) {

            const porcentaje =
                Number(
                    args[0].replace("%", "")
                );

            if (
                !Number.isFinite(porcentaje) ||
                porcentaje <= 0 ||
                porcentaje > 100
            ) {

                return message.reply(
                    "❌ Porcentaje inválido. Usa entre 1% y 100%."
                );

            }

            bet = Math.floor(
                balance * (porcentaje / 100)
            );

            if (bet <= 0)
                return message.reply(
                    "❌ La cantidad resultante es demasiado pequeña."
                );

            if (porcentaje === 50)
                modoEspecial = "50%";

        }

        // CANTIDAD NORMAL
        else {

            bet =
                convertirCantidad(args[0]);

            if (!bet) {

                return message.reply(
                    "❌ Cantidad inválida. Ejemplo: `!tragamonedas 50M`"
                );

            }

        }

        // =================================================
        // 💰 BALANCE
        // =================================================

        if (bet > balance) {

            return message.reply(
                `
❌ **No tienes suficientes monedas.**

💰 Balance:
**${formatearNumero(balance)}**

🎰 Apuesta:
**${formatearNumero(bet)}**
                `
            );

        }

        // =================================================
        // 🎲 DIFICULTAD
        // =================================================

        const dificultad =
            obtenerDificultad(bet);

        // =================================================
        // 🎯 ALL / 50%
        // =================================================

        let ganaEspecial = null;

        if (modoEspecial === "ALL") {

            // 25% ganar
            ganaEspecial =
                Math.random() < 0.25;

        }

        else if (modoEspecial === "50%") {

            // 50% ganar
            ganaEspecial =
                Math.random() < 0.50;

        }

        // =================================================
        // 🎰 ANIMACIÓN
        // =================================================

        let msg =
            await message.reply(
                "🎰 Girando tragamonedas..."
            );

        let grid = [

            [
                randomEmoji(),
                randomEmoji(),
                randomEmoji()
            ],

            [
                randomEmoji(),
                randomEmoji(),
                randomEmoji()
            ],

            [
                randomEmoji(),
                randomEmoji(),
                randomEmoji()
            ]

        ];

        for (let i = 0; i < 5; i++) {

            const fake = [

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ],

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ],

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ]

            ];

            await msg.edit(
                `
🎰 **SLOT 3x3**

${fake[0].join(" | ")}
${fake[1].join(" | ")}
${fake[2].join(" | ")}

💰 Apuesta:
${formatearNumero(bet)}

${dificultad.emoji} Dificultad:
${dificultad.nombre}

📉 Penalización:
-${dificultad.penalty * 100}%
                `
            );

            await sleep(350);

        }

        // =================================================
        // 🎲 RESULTADO
        // =================================================

        let multiplier = 0;
        let topEmoji = "❌";
        let veces = 0;

        // =================================================
        // ALL / 50%
        // =================================================

        if (ganaEspecial !== null) {

            if (ganaEspecial) {

                multiplier = 2;

                const ganador =
                    randomEmoji();

                grid = [

                    [
                        ganador,
                        ganador,
                        ganador
                    ],

                    [
                        randomEmoji(),
                        randomEmoji(),
                        randomEmoji()
                    ],

                    [
                        randomEmoji(),
                        randomEmoji(),
                        randomEmoji()
                    ]

                ];

                topEmoji = ganador;
                veces = 3;

            }

            else {

                multiplier = 0;

                grid = [

                    ["❤️", "🦈", "🍀"],
                    ["🍒", "🔥", "🍇"],
                    ["🍍", "❤️", "🦈"]

                ];

                topEmoji = "❌";
                veces = 0;

            }

        }

        // =================================================
        // 🎰 RESULTADO NORMAL
        // =================================================

        else {

            grid = [

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ],

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ],

                [
                    randomEmoji(),
                    randomEmoji(),
                    randomEmoji()
                ]

            ];

            const count = {};

            for (const e of grid.flat()) {

                count[e] =
                    (count[e] || 0) + 1;

            }

            topEmoji =
                Object.keys(count)
                    .reduce(
                        (a, b) =>
                            count[a] > count[b]
                                ? a
                                : b
                    );

            veces =
                count[topEmoji];

            // 💎 DIAMANTE
            if (topEmoji === "💎") {

                const diamond = {

                    3: 5,
                    4: 8,
                    5: 15,
                    6: 25,
                    7: 40,
                    8: 75,
                    9: 150

                };

                multiplier =
                    diamond[veces] || 0;

            }

            // 🎰 NORMAL
            else {

                const normal = {

                    3: 1.2,
                    4: 1.8,
                    5: 3,
                    6: 5,
                    7: 8,
                    8: 15,
                    9: 30

                };

                multiplier =
                    normal[veces] || 0;

            }

            // =================================================
            // 📉 APLICAR DIFICULTAD
            // =================================================

            if (multiplier > 0) {

                const probabilidadFinal =
                    1 - dificultad.penalty;

                if (
                    Math.random() >
                    probabilidadFinal
                ) {

                    multiplier = 0;

                }

            }

        }

        // =================================================
        // 💰 BONUS
        // =================================================

        const bonus =
            loadTragamonedasMultiplier();

        // =================================================
        // 💰 GANANCIA
        // =================================================

        let ganancia;

        if (multiplier === 0) {

            ganancia = -bet;

        }

        else {

            ganancia =
                Math.floor(
                    bet *
                    multiplier *
                    bonus
                );

        }

        balance += ganancia;

        if (balance < 0)
            balance = 0;

        // =================================================
        // 💾 GUARDAR
        // =================================================

        await db.query(
            `
            UPDATE users
            SET balance=$1
            WHERE discord_id=$2
            `,
            [
                balance,
                userId
            ]
        );

        // =================================================
        // 📊 ESTADÍSTICAS
        // =================================================

        await db.query(
            `
            INSERT INTO tragamonedas_stats
            (
                discord_id,
                partidas,
                victorias
            )

            VALUES
            ($1,1,$2)

            ON CONFLICT(discord_id)

            DO UPDATE SET

            partidas =
            tragamonedas_stats.partidas + 1,

            victorias =
            tragamonedas_stats.victorias + $2
            `,
            [
                userId,
                multiplier > 0 ? 1 : 0
            ]
        );

        // =================================================
        // 🎯 MISIONES
        // =================================================

        const mision =
            await avanzarMision(
                userId,
                "slots"
            );

        if (mision) {

            await message.channel.send(
                `
🎉 **MISIÓN COMPLETADA**

🎰 ${mision.nombre}

💰 +${formatearNumero(mision.recompensa)} monedas
                `
            );

        }

        await sleep(500);

        // =================================================
        // 🎰 RESULTADO FINAL
        // =================================================

        let resultadoTexto;

        if (multiplier > 0) {

            resultadoTexto =
                `🎉 **¡GANASTE!**
💰 +${formatearNumero(ganancia)}`;

        }

        else {

            resultadoTexto =
                `💀 **PERDISTE**
💸 -${formatearNumero(bet)}`;

        }

        await msg.edit(
            `
🎰 **SLOT 3x3 FINAL**

${grid[0].join(" | ")}
${grid[1].join(" | ")}
${grid[2].join(" | ")}

━━━━━━━━━━━━━━━━━━

💰 Apuesta:
**${formatearNumero(bet)}**

${dificultad.emoji} Dificultad:
**${dificultad.nombre}**

📉 Penalización:
**-${dificultad.penalty * 100}%**

🏆 Mejor:
**${topEmoji} x${veces}**

⚡ Multiplicador:
**x${multiplier}**

🎰 Bonus:
**x${bonus}**

${resultadoTexto}

💳 Balance:
**${formatearNumero(balance)}**
            `
        );

    }

};