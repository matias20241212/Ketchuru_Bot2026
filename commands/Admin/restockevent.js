const fs = require("fs");
const path = require("path");

const eventFile = path.join(__dirname, "../../data/event.json");

const allowedRoles = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1497041324631658586",
    "1465523926431039610",
    "1516896452889153646",
    "1516897210862931978"
];

function saveEvent(data) {
    fs.writeFileSync(
        eventFile,
        JSON.stringify(data, null, 2)
    );
}

module.exports = {
    name: "restockevent",

    async execute(message, args) {

        // Verificar roles
        const hasRole = message.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasRole) {
            return message.reply("❌ No tienes permisos para iniciar eventos.");
        }

        if (!args[0]) {
            return message.reply(
                "❌ Debes poner un nombre de evento.\nEjemplo: `!restockevent Halloween`"
            );
        }

        const eventName = args.join(" ");

        // Desactivar evento
        if (
            eventName.toLowerCase() === "off" ||
            eventName.toLowerCase() === "none"
        ) {
            saveEvent({
                active: false,
                name: ""
            });

            return message.reply("✅ Evento desactivado.");
        }

        // Activar evento
        saveEvent({
            active: true,
            name: eventName
        });

        return message.reply(
            `🎉 Evento iniciado: **${eventName}**`
        );
    }
};