const axios = require("axios");


const DINO_API =
"https://api.dino.gg";


async function sendDinoEvent(type, data){

    try{

        await axios.post(
            `${DINO_API}/events`,
            {
                type,
                data
            }
        );


    }catch(error){

        console.log(
            "Error Dino Integration:",
            error.message
        );

    }

}



async function userPunished(userId, reason){

    return sendDinoEvent(
        "punishment",
        {
            userId,
            reason
        }
    );

}



async function ruletaAbuse(userId){

    return sendDinoEvent(
        "ruleta_abuse",
        {
            userId
        }
    );

}



module.exports = {

    sendDinoEvent,

    userPunished,

    ruletaAbuse

};