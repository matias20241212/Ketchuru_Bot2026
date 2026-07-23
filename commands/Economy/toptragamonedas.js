const { EmbedBuilder } = require("discord.js");
const db = require("../../database");


module.exports = {

    name: "toptragamonedas",


    async execute(message) {


        const result = await db.query(

            `
            SELECT

            u.discord_id,

            u.balance,

            t.partidas,

            t.mayor_premio

            FROM users u

            INNER JOIN tragamonedas_stats t

            ON u.discord_id = t.discord_id

            ORDER BY u.balance DESC

            LIMIT 10

            `

        );



        if(result.rows.length === 0){

            return message.reply(
                "🎰 Todavía nadie ha jugado tragamonedas."
            );

        }



        let texto = "";

        let puesto = 1;



        for(const user of result.rows){


            let nombre =
            "Usuario desconocido";


            try{


                const miembro =
                await message.guild.members.fetch(
                    user.discord_id
                );


                nombre =
                miembro.user.username;


            }catch{}




            texto +=

`
**${puesto}.** 👤 ${nombre}

💰 Balance:
**${Number(user.balance).toLocaleString()}**

🎰 Partidas jugadas:
**${user.partidas}**

💎 Mayor premio:
**${Number(user.mayor_premio).toLocaleString()}**

`;



            puesto++;

        }





        const embed =

        new EmbedBuilder()

        .setTitle(
            "🏆 Top Tragamonedas"
        )

        .setDescription(
            texto
        )

        .setFooter({

            text:
            "Ranking conectado a Neon Database"

        });



        message.reply({

            embeds:[
                embed
            ]

        });



    }

};