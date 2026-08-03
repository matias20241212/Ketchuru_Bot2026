const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder
} = require("discord.js");


const giftSystem = require("../../systems/gifts/giftSystem");


module.exports = {

name:"bandeja",


async ejecutar(message,args){


    let regalos = await giftSystem.obtenerRegalos(
        message.author.id
    );


    if(regalos.length === 0){

        return message.reply(
            "🎁 Tu bandeja está vacía."
        );

    }



    let pagina = 0;

    const porPagina = 5;



    function crearEmbed(){


        const inicio = pagina * porPagina;


        const lista = regalos.slice(
            inicio,
            inicio + porPagina
        );



        let texto="";



        lista.forEach((r,i)=>{

            texto +=
`
**${i+1}. ${r.item} x${r.amount}**
🎁 De: <@${r.sender_id}>

`;

        });



        return new EmbedBuilder()

        .setTitle(
            `🎁 Bandeja de regalos de ${message.author.username}`
        )

        .setDescription(
            texto +
            `
Página ${pagina+1}/${Math.ceil(regalos.length/5)}
`
        );

    }




    function botones(){


        return new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()
            .setCustomId("gift_prev")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary),


            new ButtonBuilder()
            .setCustomId("gift_next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary),


            new ButtonBuilder()
            .setCustomId("gift_all_accept")
            .setLabel("🎁 Recibir todo")
            .setStyle(ButtonStyle.Success),


            new ButtonBuilder()
            .setCustomId("gift_reject")
            .setLabel("❌ Rechazar emoji")
            .setStyle(ButtonStyle.Danger),


            new ButtonBuilder()
            .setCustomId("gift_accept")
            .setLabel("✅ Aceptar emoji")
            .setStyle(ButtonStyle.Success)

        );

    }



    function botones2(){


        return new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()
            .setCustomId("gift_reject_all")
            .setLabel("🚫 Rechazar todo")
            .setStyle(ButtonStyle.Danger),


            new ButtonBuilder()
            .setCustomId("gift_close")
            .setLabel("🔒 Cerrar bandeja")
            .setStyle(ButtonStyle.Secondary)

        );

    }




    const msg = await message.reply({

        embeds:[
            crearEmbed()
        ],

        components:[
            botones(),
            botones2()
        ]

    });




    const collector =
    msg.createMessageComponentCollector({

        time:600000

    });




    collector.on("collect",async i=>{


        if(i.user.id !== message.author.id){

            return i.reply({

                content:
                "❌ Esta bandeja no es tuya.",

                ephemeral:true

            });

        }




        if(i.customId==="gift_prev"){


            if(pagina>0)
                pagina--;


            await i.update({

                embeds:[
                    crearEmbed()
                ],

                components:[
                    botones(),
                    botones2()
                ]

            });

        }




        if(i.customId==="gift_next"){


            if(
            pagina <
            Math.ceil(regalos.length/5)-1
            )

            pagina++;



            await i.update({

                embeds:[
                    crearEmbed()
                ],

                components:[
                    botones(),
                    botones2()
                ]

            });


        }




        if(i.customId==="gift_all_accept"){


            await i.reply({

                content:
                "🎁 Todos tus regalos fueron enviados al inventario.",

                ephemeral:true

            });


        }




        if(i.customId==="gift_close"){


            await i.update({

                content:
                "🔒 Bandeja cerrada.",

                embeds:[],

                components:[]

            });


            collector.stop();

        }



        if(i.customId==="gift_reject_all"){


            await i.reply({

                content:
                "🚫 Todos los regalos fueron rechazados.",

                ephemeral:true

            });


        }



        if(
        i.customId==="gift_accept" ||
        i.customId==="gift_reject"
        ){


            let opciones =
            regalos.map((r)=>({

                label:
                `${r.item} x${r.amount}`,

                value:
                String(r.id)

            }));



            const menu =
            new StringSelectMenuBuilder()

            .setCustomId(
                "gift_select"
            )

            .setPlaceholder(
                "Selecciona un regalo"
            )

            .addOptions(opciones);



            await i.reply({

                content:
                "🎁 Selecciona un regalo:",

                components:[
                    new ActionRowBuilder()
                    .addComponents(menu)
                ],

                ephemeral:true

            });

        }


    });



    collector.on("end",()=>{


        msg.edit({

            components:[]

        }).catch(()=>{});


    });



}

};