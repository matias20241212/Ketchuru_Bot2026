const fs = require("fs");

const balanceFile = "./data/balance.json";

function loadBalances() {
    if (!fs.existsSync(balanceFile)) return {};
    return JSON.parse(fs.readFileSync(balanceFile));
}

module.exports = {
    name: "top",

    async execute(message) {
        const balances = loadBalances();

        const sorted = Object.entries(balances)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        let text = "🏆 **TOP MÁS RICOS DEL SERVIDOR**\n\n";

        for (let i = 0; i < sorted.length; i++) {
            const [userId, money] = sorted[i];

            const user = await message.client.users.fetch(userId).catch(() => null);

            text += `#${i + 1} - ${user ? user.username : "Usuario"}: 💰 ${money}\n`;
        }

        message.reply(text);
    }
};