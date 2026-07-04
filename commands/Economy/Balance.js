const fs = require("fs");

const balanceFile = "./data/balance.json";

function loadBalances() {
    if (!fs.existsSync(balanceFile)) return {};
    return JSON.parse(fs.readFileSync(balanceFile));
}

module.exports = {
    name: "balance",

    execute(message) {
        const balances = loadBalances();

        const userId = message.author.id;

        const money = balances[userId] || 50;

        message.reply(`💰 Tienes **${money} monedas**`);
    }
};