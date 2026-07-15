const db = require("../../database");

const tragamonedasMultiplierFile = "./data/tragamonedasMultiplier.json";

function loadTragamonedasMultiplier() {
    const fs = require("fs");

    if (!fs.existsSync(tragamonedasMultiplierFile)) return 1;

    const data = JSON.parse(
        fs.readFileSync(tragamonedasMultiplierFile)
    );

    return data.level || 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: "tragamonedas",

    async execute(message, args) {

        const userId = message.author.id;

        let result = await db.query(
            "SELECT balance FROM users WHERE discord_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            await db.query(
                "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                [userId, 50]
            );

            result = await db.query(
                "SELECT balance FROM users WHERE discord_id = $1",
                [userId]
            );
        }

        let balance = Number(result.rows[0].balance);

        const allowedBets = [10, 50, 100, 500, 1000, 2500, 5000, 10000, 50000];
        const bet = parseInt(args[0]);

        if (!allowedBets.includes(bet)) {
            return message.reply("❌ Apuesta inválida.");
        }

        if (balance < bet) {
            return message.reply("❌ No tienes suficientes monedas.");
        }

        const emojis = ["❤️", "🦈", "🍀", "🍒", "💎", "🔥", "🍇", "🍍"];

        let msg = await message.reply("🎰 Girando slot 3x3...");


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


        const premioMultiplier = loadTragamonedasMultiplier();


        let ganancia = multiplier === 0
            ? -bet
            : Math.floor(bet * multiplier * premioMultiplier);


        balance += ganancia;


        if (balance < 0) {
            balance = 0;
        }


        await db.query(
            "UPDATE users SET balance = $1 WHERE discord_id = $2",
            [balance, userId]
        );


        await sleep(400);


        msg.edit(
            `🎰 SLOT 3x3 FINAL\n\n` +
            `${grid[0].join(" | ")}\n` +
            `${grid[1].join(" | ")}\n` +
            `${grid[2].join(" | ")}\n\n` +
            `🏆 Mejor: ${topEmoji} x${veces}\n` +
            `🎲 Apuesta: ${bet}\n` +
            `⚡ Mult: x${multiplier}\n` +
            `🎰 Bonus tragamonedas: x${premioMultiplier}\n` +
            `💰 Cambio: ${ganancia}\n` +
            `💳 Balance: ${balance}`
        );
    }
};