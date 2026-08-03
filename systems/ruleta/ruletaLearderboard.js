const {
    EmbedBuilder
} = require("discord.js");


const stats = require("./ruletaStates");



async function getLeaderboard(){


    const players = [];


    for(
        const [id,data]
        of stats.players
    ){


        players.push({

            id,

            wins:data.wins || 0,

            losses:data.losses || 0,

            games:data.games || 0,

            money:data.money || 0

        });


    }



    players.sort(
        (a,b)=>
        b.wins - a.wins
    );



    const top =
    players.slice(
        0,
        10
    );



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🎰 Top Ruleta Ketchuru"
    )

    .setDescription(
        top.length
        ?
        top.map(
            (p,index)=>
            
`**${index+1}.** <@${p.id}>

🏆 Victorias: **${p.wins}**
💀 Derrotas: **${p.losses}**
🎲 Partidas: **${p.games}**
💰 Ganado: **${p.money}🪙**`

        ).join("\n\n")

        :

        "No hay jugadores todavía."
    )

    .setColor(
        "Gold"
    )

    .setTimestamp();



    return embed;


}



module.exports = {

    getLeaderboard

};