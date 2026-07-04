const fs = require("fs");

const balanceFile = "./data/balance.json";

function load() {
    if (!fs.existsSync(balanceFile)) return {};
    return JSON.parse(fs.readFileSync(balanceFile));
}

function save(data) {
    fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: "tragamonedas",
    async execute(message, args) {

        let balances = load();
        const userId = message.author.id;

        const allowedBets = [10, 50, 100, 500, 1000, 2500, 5000, 10000, 50000];
        const bet = parseInt(args[0]);

        if (!allowedBets.includes(bet)) {
            return message.reply("❌ Apuesta inválida.");
        }

        if (!balances[userId]) balances[userId] = 50;

        if (balances[userId] < bet) {
            return message.reply("❌ No tienes suficientes monedas.");
        }

        const emojis = ["❤️", "🦈", "🍀", "🍒", "💎", "🔥", "🍇", "🍍"];

        let msg = await message.reply("🎰 Girando slot 3x3...");

        // =========================
        // 🎬 ANIMACIÓN 3x3
        // =========================
        for (let i = 0; i < 5; i++) {

            const fake = [
                [0,0,0],
                [0,0,0],
                [0,0,0]
            ].map(row =>
                row.map(() => emojis[Math.floor(Math.random() * emojis.length)])
            );

            await msg.edit(
                `🎰 SLOT 3x3\n\n` +
                `${fake[0].join(" | ")}\n` +
                `${fake[1].join(" | ")}\n` +
                `${fake[2].join(" | ")}`
            );

            await sleep(350);
        }

        // =========================
        // 🎯 RESULTADO FINAL 3x3
        // =========================
        const grid = [
            Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]),
            Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]),
            Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
        ];

        const all = grid.flat();

        const count = {};
        for (const e of all) {
            count[e] = (count[e] || 0) + 1;
        }

        let topEmoji = Object.keys(count).reduce((a, b) =>
            count[a] > count[b] ? a : b
        );

        let veces = count[topEmoji];

        let multiplier = 0;

        // =========================
        // 💎 DIAMANTE
        // =========================
        if (topEmoji === "💎") {

            const tabla = {
                3: 10.25,
                4: 10.75,
                5: 11.50,
                6: 12.75,
                7: 13.50,
                8: 14.25,
                9: 15
            };

            multiplier = tabla[veces] || 0;
        }

        // =========================
        // 🎰 OTROS EMOJIS
        // =========================
        else {

            const tabla = {
                2: 2,
                3: 4,
                4: 5,
                5: 6,
                6: 7,
                7: 8,
                8: 9,
                9: 10
            };

            multiplier = tabla[veces] || 0;
        }

        let ganancia = multiplier === 0 ? -bet : Math.floor(bet * multiplier);

        balances[userId] += ganancia;

        if (balances[userId] < 0) balances[userId] = 0;

        save(balances);

        await sleep(400);

        msg.edit(
            `🎰 SLOT 3x3 FINAL\n\n` +
            `${grid[0].join(" | ")}\n` +
            `${grid[1].join(" | ")}\n` +
            `${grid[2].join(" | ")}\n\n` +
            `🏆 Mejor: ${topEmoji} x${veces}\n` +
            `🎲 Apuesta: ${bet}\n` +
            `⚡ Mult: x${multiplier}\n` +
            `💰 Cambio: ${ganancia}\n` +
            `💳 Balance: ${balances[userId]}`
        );
    }
};