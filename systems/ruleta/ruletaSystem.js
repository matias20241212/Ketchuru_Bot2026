const {
    EmbedBuilder
} = require("discord.js");


const config = require("./ruletaConfig");

const game = require("./ruletaGame");

const cooldown = require("./ruletaCooldown");

const antiAbuse = require("./ruletaAntiAbuse");

const history = require("./ruletaHistory");

const proteccionRuleta = require("../moderation/proteccionRuleta");

const leaderboard = require("./ruletaLeaderboard");

const logs = require("./ruletaLogs");

const buttons = require("./ruletaButtons");

const states = require("./ruletaStates");



async function start(message, bet){


    const userId = message.author.id;



   const abuse = antiAbuse.check(userId);

const proteccion = proteccionRuleta.check(userId);


if(abuse.blocked || proteccion.blocked){

    return message.reply(
        "🚫 Demasiados intentos de ruleta."
    );

}



    const cd = cooldown.checkCooldown(userId);


    if(cd.active){

        return message.reply(
            `⏳ Espera ${Math.ceil(cd.remaining / 1000)} segundos.`
        );

    }



    if(
        bet < config.minBet ||
        bet > config.maxBet
    ){

        return message.reply(
            `❌ La apuesta debe ser entre ${config.minBet} y ${config.maxBet}`
        );

    }



    states.create(
        userId,
        {
            bet
        }
    );



    cooldown.setCooldown(userId);



    const embed = new EmbedBuilder()

    .setTitle("🎰 Ruleta Ketchuru")

    .setDescription(
        `Apuesta: **${bet} 🪙**\n\nElige tu color:`
    )

    .setColor("Gold");



    const msg = await message.reply({

        embeds:[
            embed
        ],

        components:[
            buttons.createButtons(userId)
        ]

    });



    const collector =
    msg.createMessageComponentCollector({

        time:30000

    });



    collector.on(
        "collect",
        async interaction=>{


            if(interaction.user.id !== userId){

                return interaction.reply({

                    content:
                    "❌ Esta ruleta no es tuya.",

                    ephemeral:true

                });

            }



            const choice =
            interaction.customId.split("_")[1];



            const result =
            game.play();



            const reward =
           game.calculateReward(
    userId,
    bet,
    result,
    choice
);



            history.add(
                userId,
                {

                    bet,

                    choice,

                    result:result.color,

                    reward:reward.reward

                }

            );



            if(reward.win){

                leaderboard.addWin(
                    userId,
                    reward.reward
                );

            }



            await interaction.update({

                embeds:[

                    new EmbedBuilder()

                    .setTitle("🎰 Resultado Ruleta")

                    .setDescription(

                        `Elegiste: ${config.colors[choice]}\n`+
                        `Salió: ${result.emoji}\n\n`+

                        reward.win

                        ?

                        `🎉 Ganaste **${reward.reward} 🪙**`

                        :

                        "💀 Perdiste la apuesta"

                    )

                    .setColor(
                        reward.win
                        ?
                        "Green"
                        :
                        "Red"
                    )

                ],

                components:[]

            });



            await logs.sendLog(
                message.client,
                {

                    userId,

                    bet,

                    result:result.color,

                    reward:reward.reward

                }

            );



            states.delete(userId);


        }

    );


}



module.exports = {

    start

};