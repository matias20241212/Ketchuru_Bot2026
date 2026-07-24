const db = require("../../database");
const { generarMisiones } = require("../../systems/missionGenerator");


module.exports = {

    name: "misiones",


    async execute(message){

        const userId = message.author.id;


        // Crear misiones si no tiene
        await generarMisiones(userId);



        const data = await db.query(
        `
        SELECT

        missions.name,
        missions.description,
        missions.goal,

        COALESCE(user_missions.progress,0) AS progress,
        COALESCE(user_missions.completed,false) AS completed,

        COALESCE(user_missions.reward_type, missions.reward_type) AS reward_type,

        user_missions.reward_item,
        user_missions.reward_rarity,
        user_missions.reward_coupon,
        user_missions.reward_coins


        FROM user_missions


        JOIN missions

        ON missions.id = user_missions.mission_id



        WHERE user_missions.discord_id=$1


        ORDER BY user_missions.completed ASC,
        user_missions.id ASC


        LIMIT 5

        `,
        [
            userId
        ]
        );




        if(data.rows.length === 0){

            return message.reply(
                "❌ No tienes misiones actualmente."
            );

        }




        let texto = `
📜 **MISIONES ACTUALES**

`;



        data.rows.forEach((m,i)=>{


            let recompensa = "❓ Sin recompensa";



            if(m.reward_type === "coins"){


                recompensa =
                `💰 ${m.reward_coins || 0} monedas`;


            }


            else if(m.reward_type === "item"){


                recompensa =
                `
🎁 ${m.reward_item || "Objeto desconocido"}

⭐ Rareza:
${m.reward_rarity || "Normal"}
`;

            }



            else if(m.reward_type === "coupon"){


                recompensa =
                `
🎟️ Cupón descuento:

-${m.reward_coupon || 0}%
`;

            }




            texto +=
`
${i+1}️⃣ **${m.name}**

📝 ${m.description}

📊 Progreso:
${m.progress}/${m.goal}


🎁 Recompensa:
${recompensa}


${m.completed ? "✅ Completada":"⏳ En progreso"}

━━━━━━━━━━━━━━

`;

        });




        message.reply(texto);


    }


};