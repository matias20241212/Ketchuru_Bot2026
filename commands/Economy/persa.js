const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const marketSystem = require("../../systems/market/marketSystem");



module.exports = {

name:"persa",



async ejecutar(message,args){



    let ventas;

    let stats = null;



    const usuario =
    message.mentions.users.first();



    // Persa específico de usuario

    if(usuario){


        ventas =
        await marketSystem.obtenerVentasUsuario(
            usuario.id
        );


        stats =
        await marketSystem.obtenerEstadisticas(
            usuario.id
        );



    }else{


        ventas =
        await marketSystem.obtenerVentas();


    }





    if(ventas.length === 0){


        return message.reply(
            "🏪 El 𝖕𝖊𝖗𝖘𝖆 está vacío."
        );


    }





    let paginas=[];



    for(
        let i=0;
        i<ventas.length;
        i+=5
    ){

        paginas.push(
            ventas.slice(i,i+5)
        );

    }




    let pagina=0;





    function crearEmbed(){


        const lista =
        paginas[pagina];



        let texto="";



        lista.forEach((venta,index)=>{


            texto +=
`
**${index+1}. ${venta.item} x${venta.amount}**

💰 ${venta.price_each.toLocaleString()}🪙 c/u

📝 ${venta.note || "Sin descripción"}

👤 <@${venta.seller_id}>

━━━━━━━━━━━━

`;

        });





        let titulo;



        if(usuario){


            titulo =
`
🏪 𝖕𝖊𝖗𝖘𝖆 | ${usuario.username}

⭐ Reputación: ${stats.estrellas}
🛒 Ventas: ${stats.ventas}
📦 Publicaciones: ${stats.publicaciones}
`;



        }else{


            titulo =
            "🏪 𝖕𝖊𝖗𝖘𝖆";


        }





        return new EmbedBuilder()

        .setTitle(titulo)

        .setDescription(texto)

        .setFooter({

            text:
            `Página ${pagina+1}/${paginas.length}`

        });



    }





    const botones =
    new ActionRowBuilder()

    .addComponents(


        new ButtonBuilder()

        .setCustomId("persa_prev")

        .setLabel("⬅️")

        .setStyle(ButtonStyle.Secondary),



        new ButtonBuilder()

        .setCustomId("persa_next")

        .setLabel("➡️")

        .setStyle(ButtonStyle.Secondary)


    );






    const msg =
    await message.reply({

        embeds:[
            crearEmbed()
        ],

        components:[
            botones
        ]

    });







    const collector =
    msg.createMessageComponentCollector({

        time:600000

    });







    collector.on(
    "collect",
    async interaction=>{



        if(
        interaction.user.id !== message.author.id
        ){


            return interaction.reply({

                content:
                "❌ No puedes usar este Persa.",

                ephemeral:true

            });


        }






        if(
        interaction.customId === "persa_next"
        ){


            if(
            pagina < paginas.length-1
            ){

                pagina++;

            }


        }






        if(
        interaction.customId === "persa_prev"
        ){


            if(pagina > 0)
            {

                pagina--;

            }


        }






        await interaction.update({

            embeds:[
                crearEmbed()
            ],

            components:[
                botones
            ]

        });



    });







    collector.on("end",()=>{


        msg.edit({

            components:[]

        }).catch(()=>{});


    });





}

};