const modlog =
require("./modlog");


const dino =
require("../dino/dinoIntegration");



async function punish(
guild,
user,
type,
reason
){



    let action;



    switch(type){


        case "warn":

            action =
            "⚠️ Advertencia";

            break;



        case "mute":

            action =
            "🔇 Silenciado";

            break;



        case "kick":

            action =
            "👢 Expulsado";

            break;



        case "ban":

            action =
            "🔨 Baneado";

            break;



        default:

            action =
            "❓ Desconocido";

    }




    await modlog.sendLog(

        guild.client,

        guild,

        {

            channel:
            process.env.MODLOG_CHANNEL,

            userId:user.id,

            action,

            reason

        }

    );



    await dino.userPunished(

        user.id,

        reason

    );



}



module.exports = {

    punish

};