const db = require("../../database");
const { generarMisionesUsuario } = require("../../systems/missionGenerator");


module.exports = {

name:"misiones",


async execute(message){


const userId = message.author.id;



await generarMisionesUsuario(userId);



const data = await db.query(
`
SELECT
missions.name,
missions.description,
missions.goal,
missions.reward,
user_missions.progress,
user_missions.completed

FROM user_missions

JOIN missions
ON missions.id = user_missions.mission_id

WHERE user_missions.discord_id=$1

AND expires_at > NOW()
`,
[
userId
]
);



let texto =
`
📜 **MISIONES ACTUALES**

`;



data.rows.forEach((m,i)=>{


texto +=
`
${i+1}️⃣ **${m.name}**

📊 Progreso:
${m.progress}/${m.goal}

🎁 Recompensa:
💰 ${m.reward} monedas

${m.completed ? "✅ Completada":"⏳ En progreso"}

`;

});



message.reply(texto);



}

};