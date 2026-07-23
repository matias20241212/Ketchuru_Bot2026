const {
    EmbedBuilder
} = require("discord.js");

const db = require("../../database");

const {
    getInventory,
    removeItem
} = require("../../systems/inventory");

const {
    paginate
} = require("../../systems/inventorySystem");

const {
    createInventoryButtons
} = require("../../systems/inventoryMenu");

function getDuration(effect){

    if(!effect) return null;


    const match =
    effect.match(/(\d+)\s*min/);


    if(!match) return null;


    const minutes =
    Number(match[1]);


    return minutes;

}

module.exports = {

    name: "inventory",


    async execute(message, args) {


        const owner = message.author;

        let target = owner;



        // =========================
        // 👤 VER INVENTARIO DE OTRO
        // =========================

        if(args[0]){


            const user =
            message.mentions.users.first();



            if(!user){

                return message.reply(
                    "❌ Usuario inválido."
                );

            }



            target = user;

        }





        const items =
        await getInventory(
            target.id
        );



        let page = 0;

        const perPage = 10;



        const totalPages =
        Math.max(
            1,
            Math.ceil(
                items.length / perPage
            )
        );





        function createEmbed(){


            const current =
            paginate(
                items,
                page,
                perPage
            );



            return new EmbedBuilder()

            .setTitle(
                `🎒 Inventario de ${target.username}`
            )


            .setDescription(

                current.length

                ?

                current.map(item =>
                `${item.emoji || "📦"} ${item.item} x${item.amount}`
                ).join("\n")


                :

                "📦 Inventario vacío"

            )


            .setFooter({

                text:
                `Página ${page + 1}/${totalPages}`

            });


        }







        const msg =
        await message.reply({

            embeds:[
                createEmbed()
            ],


            components:

            createInventoryButtons(

                paginate(
                    items,
                    page,
                    perPage
                ),

                page,

                totalPages,

                owner.id

            )

        });









        const collector =
        msg.createMessageComponentCollector({

            time:300000

        });







        collector.on(
            "collect",
            async interaction => {



                // =========================
                // 🔒 SOLO DUEÑO
                // =========================


                if(
                    interaction.user.id !== owner.id
                ){

                    return interaction.reply({

                        content:
                        "❌ Este inventario no pertenece a este usuario.",

                        ephemeral:true

                    });

                }







                // =========================
                // 🚪 SALIR
                // =========================


                if(
                    interaction.customId.startsWith("inv_exit")
                ){


                    await interaction.update({

                        content:
                        "⏳ Inventario cerrado.",

                        embeds:[],

                        components:[]

                    });


                    collector.stop();

                    return;

                }









                // =========================
                // ▶ SIGUIENTE
                // =========================


                if(
                    interaction.customId.startsWith("inv_next")
                ){


                    if(page + 1 < totalPages){

                        page++;

                    }



                    return interaction.update({

                        embeds:[
                            createEmbed()
                        ],


                        components:

                        createInventoryButtons(

                            paginate(
                                items,
                                page,
                                perPage
                            ),

                            page,

                            totalPages,

                            owner.id

                        )

                    });


                }









                // =========================
                // ◀ ANTERIOR
                // =========================


                if(
                    interaction.customId.startsWith("inv_back")
                ){


                    if(page > 0){

                        page--;

                    }



                    return interaction.update({

                        embeds:[
                            createEmbed()
                        ],


                        components:

                        createInventoryButtons(

                            paginate(
                                items,
                                page,
                                perPage
                            ),

                            page,

                            totalPages,

                            owner.id

                        )

                    });


                }









                // =========================
                // ⚡ ACTIVAR PODER
                // =========================


                if(
                    interaction.customId.startsWith("inv_item")
                ){



                    const data =
                    interaction.customId.split("_");



                    const index =
                    Number(data[3]);



                    const current =
                    paginate(
                        items,
                        page,
                        perPage
                    );



                    const objeto =
                    current[index];



                    if(!objeto){


                        return interaction.reply({

                            content:
                            "❌ No se encontró el objeto.",

                            ephemeral:true

                        });

                    }

const minutes =
getDuration(objeto.effect);



const expires =
minutes
?
new Date(Date.now() + minutes * 60000)
:
null;




await db.query(

`
INSERT INTO active_history
(
    discord_id,
    emoji,
    item,
    effect,
    activated_at,
    expires_at
)

VALUES
($1,$2,$3,$4,NOW(),$5)
`,

[
    interaction.user.id,
    objeto.emoji,
    objeto.item,
    objeto.effect,
    expires
]

);



                    return interaction.reply({

                        content:

`
⚡ **PODER ACTIVADO**

${objeto.emoji || "📦"} **${objeto.item}**

✨ Efecto:
${objeto.effect || "Sin efecto"}

⏳ Duración:
${minutes ? minutes + " minutos" : "Permanente"}

📅 Activado:
Ahora
`,

                        ephemeral:true

                    });


                }




            }

        );









        // =========================
        // ⏳ EXPIRAR MENÚ
        // =========================


        collector.on(
            "end",
            async()=>{


                try{


                    await msg.edit({

                        content:
                        "⏳ Este menú expiró después de 5 minutos.",

                        components:[]

                    });


                }catch{}



            }
        );




    }

};