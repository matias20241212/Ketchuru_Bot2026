const { EmbedBuilder } = require("discord.js");

const { getInventory } = require("../../systems/inventory");


const allowedRoles = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1516897210862931978",
    "1516896452889153646",
    "1512179364194947343",
    "1497041324631658586",
    "1465523926431039610"
];


module.exports = {

    name: "publicinventory",

    async execute(message) {


        // =========================
        // 🔒 PERMISOS ADMIN
        // =========================

        const hasPermission =
            message.member.roles.cache.some(role =>
                allowedRoles.includes(role.id)
            );


        if (!hasPermission) {

            return message.reply(
                "❌ No tienes permisos para usar este comando."
            );

        }



        // =========================
        // 🎒 INVENTARIO PÚBLICO
        // =========================

        const user = message.author;


        const items =
            await getInventory(user.id);



        const embed =
            new EmbedBuilder()

            .setTitle(
                `🌎 Inventario público de ${user.username}`
            )

            .setDescription(

                items.length

                ?

                items.map(item =>
                    `${item.item} x${item.amount}`
                ).join("\n")

                :

                "📦 Inventario vacío"

            )

            .setFooter({
                text:
                "Inventario público • Solo visual"
            });



        message.channel.send({

            embeds:[
                embed
            ]

        });


    }

};