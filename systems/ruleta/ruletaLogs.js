async function sendLog(client, data){

    try{

        const channelId = process.env.RULETA_LOG_CHANNEL;


        if(!channelId) return;


        const channel = await client.channels.fetch(channelId);


        if(!channel) return;


        await channel.send({

            embeds:[{

                title:"🎰 Registro Ruleta",

                fields:[

                    {
                        name:"Usuario",
                        value:`<@${data.userId}>`
                    },

                    {
                        name:"Apuesta",
                        value:`${data.bet} 🪙`
                    },

                    {
                        name:"Resultado",
                        value:data.result
                    },

                    {
                        name:"Ganancia",
                        value:`${data.reward} 🪙`
                    }

                ],

                timestamp:new Date()

            }]

        });


    }catch(err){

        console.log(
            "Error logs ruleta:",
            err.message
        );

    }

}



module.exports = {
    sendLog
};