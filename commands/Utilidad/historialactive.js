const db = require("../../database");

module.exports = {
    nombre: "historialactive",

    async ejecutar(message) {

        const guild = message.guild;
        const user = message.author;


        try {


            const existentes = guild.channels.cache.filter(
                c =>
                c.name.includes(`historial-${user.username.toLowerCase()}`)
            );


            if (existentes.size > 0) {

                return message.reply(
                    `⚠️ Ya tienes un historial abierto.\n\n🎫 ${existentes.first()}`
                );

            }


            const numero = existentes.size + 1;


            const canal = await guild.channels.create({

                name:
                `🎫・Historial-(${numero})-${user.username}`,

                type: 0,

                permissionOverwrites: [

                    {
                        id: guild.roles.everyone.id,
                        deny: ["ViewChannel"]
                    },

                    {
                        id: user.id,
                        allow:[
                            "ViewChannel",
                            "SendMessages"
                        ]
                    },

                    {
                        id: guild.members.me.id,
                        allow:[
                            "ViewChannel",
                            "SendMessages",
                            "ManageChannels"
                        ]
                    }

                ]

            });



            const historial = await db.query(`

                SELECT *
                FROM active_history
                WHERE discord_id = $1
                ORDER BY activated_at DESC

            `,[user.id]);



            let texto = `
📜 **HISTORIAL DE ACTIVACIONES**
━━━━━━━━━━━━━━━━━━

👤 Usuario:
${user}

⚡ Activaciones:

`;



            if(historial.rows.length === 0){

                texto += "❌ No tienes activaciones registradas.";

            }else{


                historial.rows.forEach(item=>{

                    texto += `
${item.emoji} **${item.item}**
📅 ${item.activated_at}
⏳ Expira:
${item.expires_at ?? "Sin duración"}

`;

                });

            }



            texto += `
━━━━━━━━━━━━━━━━━━

🔒 Historial privado
❌ Para cerrar usa:
\`!Closeactive\`
`;



            await canal.send(texto);



            await message.reply(
                `✅ Historial creado:\n${canal}`
            );



        } catch(error){

            console.error(error);

            message.reply(
                "❌ No pude crear tu historial."
            );

        }

    }
};