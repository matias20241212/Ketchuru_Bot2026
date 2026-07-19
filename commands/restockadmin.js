const { restockShop, formatShop } = require("../systems/shop");

const ROLES_PERMITIDOS = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1516897210862931978",
    "1516896452889153646",
    "1512179364194947343",
    "1497041324631658586",
    "1465523926431039610",
    "1522003060426276905",
    "1522002541355732992"
];


module.exports = {

    name: "restock",

    async execute(message, args) {
        console.log("RESTOCK EJECUTADO");


        const tienePermiso = message.member.roles.cache.some(
            rol => ROLES_PERMITIDOS.includes(rol.id)
        );


        if (!tienePermiso) {
            return message.reply(
                "❌ No tienes permiso para usar este comando."
            );
        }



        restockShop();



        const hammerTimes = "⚒️ Próximos horarios disponibles en HAMMER TIME GLOBAL";


        const canal = message.guild.channels.cache.get(
            "1523399225071894659"
        );



        const texto =
`<@&1523402217556672672>

🛒 **KETCHURU SHOP SE HA RESTOCKEADO!**

${formatShop().slice(0, 1900)}

💡 Usa \`!buy <emoji>\`

⚒️ **HAMMER TIME GLOBAL**

🌍 Próximos horarios:
${hammerTimes}`;



        if (canal) {
            canal.send(texto).catch(console.error);
        }


        message.reply(
            "✅ Restock realizado correctamente."
        );

    }

};