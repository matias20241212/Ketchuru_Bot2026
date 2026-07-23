const { EmbedBuilder } = require("discord.js");
const db = require("../../database");


module.exports = {

name:"statstragamonedas",


async execute(message){


const userId =
message.author.id;



const result =
await db.query(

`
SELECT *

FROM tragamonedas_stats

WHERE discord_id=$1
`,

[userId]

);



if(result.rows.length === 0){

return message.reply(
"🎰 Todavía no has jugado tragamonedas."
);

}



const stats =
result.rows[0];



const embed =
new EmbedBuilder()

.setTitle(
"🎰 Estadísticas Tragamonedas"
)

.setDescription(

`
🎲 Partidas jugadas:
**${stats.partidas}**

🏆 Victorias:
**${stats.victorias}**

💀 Derrotas:
**${stats.derrotas}**

📈 Monedas ganadas:
**${stats.monedas_ganadas}**

📉 Monedas perdidas:
**${stats.monedas_perdidas}**

💎 Mayor premio:
**${stats.mayor_premio}**

`

)

.setFooter({

text:
`Jugador: ${message.author.username}`

});



message.reply({

embeds:[
embed
]

});


}

};