const leaderboard = require("../../systems/ruleta/ruletaLeaderboard");


module.exports = {

    name: "topruleta",

    description: "Muestra el ranking de jugadores de ruleta",


    async execute(message){


        const embed = await leaderboard.getLeaderboard();



        message.channel.send({
            embeds:[
                embed
            ]
        });


    }

};