const fs = require("fs");
const path = require("path");

const multiplierFile = path.join(__dirname, "../../data/multiplier.json");

const allowedRoles = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1497041324631658586",
    "1465523926431039610",
    "1516896452889153646",
    "1516897210862931978"
];

function saveMultiplier(level) {
    fs.writeFileSync(
        multiplierFile,
        JSON.stringify({
            level: level
        }, null, 2)
    );
}

module.exports = {
    name: "multiplier",

    async execute(message, args) {

        const hasRole = message.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasRole) {
            return message.reply("❌ No tienes permisos para usar este comando.");
        }

        const amount = Number(args[0]);

        if (!amount || amount < 1 || amount > 15) {
            return message.reply(
                "❌ El multiplicador debe ser entre **1 y 15**."
            );
        }

        saveMultiplier(amount);

        return message.reply(
            `🍀 Multiplicador de tienda establecido en **x${amount}**`
        );
    }
};