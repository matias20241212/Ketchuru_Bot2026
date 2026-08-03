const {
    EmbedBuilder
} = require("discord.js");


async function sendLog(
client,
guild,
data
){


    const channel =
    guild.channels.cache.get(
        data.channel
    );


    if(!channel)
        return;



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🛡️ Registro Moderación"
    )

    .addFields(

        {
            name:"👤 Usuario",
            value:`<@${data.userId}>`
        },

        {
            name:"⚠️ Acción",
            value:data.action
        },

        {
            name:"📄 Razón",
            value:data.reason || "Sin razón"
        }

    )

    .setTimestamp();



    channel.send({

        embeds:[
            embed
        ]

    });


}



module.exports = {

    sendLog

};