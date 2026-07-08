const { DateTime } = require("luxon");
const { getNextHammerTime, getUTCList } = require("../systems/hammertime.js");


module.exports = {
    nombre: "restocktime",

    async ejecutar(message) {

        const proximo = getNextHammerTime();

        if (!proximo) {
            return message.reply("⚒️ No se pudo calcular el próximo HAMMER TIME.");
        }


        function getUTCList(date) {
            const zones = [];

            for (let offset = -12; offset <= 14; offset++) {

                const name = offset === 0
                    ? "UTC±00"
                    : offset > 0
                        ? `UTC+${offset}`
                        : `UTC${offset}`;

                const time = date
                    .setZone("UTC")
                    .plus({ hours: offset })
                    .toFormat("HH:mm");

                zones.push(`${name}: ${time}`);
            }

            return zones.join("\n");
        }


        const listaUTC = getUTCList(proximo);


        message.reply(
`⚒️ **HAMMER TIME GLOBAL**

🌍 Próximo restock:

${listaUTC}

🛒 Ketchuru Shop`
        );
    }
};