const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const giftSystem = require("./giftSystem");


async function mostrarSeleccionRegalo(interaction, regalos, accion){


    const opciones = regalos.map(r => ({

        label: `${r.item} x${r.amount}`,

        description:
        `De: ${r.sender_id}`,

        value:
        String(r.id)

    }));



    const menu =
    new StringSelectMenuBuilder()

    .setCustomId(
        `gift_choose_${accion}`
    )

    .setPlaceholder(
        "Selecciona un regalo"
    )

    .addOptions(opciones);



    await interaction.reply({

        content:
        accion === "accept"
        ?
        "✅ ¿Qué regalo quieres aceptar?"
        :
        "❌ ¿Qué regalo quieres rechazar?",


        components:[

            new ActionRowBuilder()
            .addComponents(menu)

        ],

        ephemeral:true

    });


}




async function aceptar(interaction,id){


    const regalo =
    await giftSystem.aceptarRegalo(
        id,
        interaction.user.id
    );



    if(!regalo){

        return interaction.reply({

            content:
            "❌ Ese regalo ya no existe.",

            ephemeral:true

        });

    }



    await interaction.reply({

        content:
`
🎁 Regalo recibido

📦 ${regalo.item} x${regalo.amount}

Añadido a tu inventario.
`,

        ephemeral:true

    });


}





async function rechazar(interaction,id){


    const regalo =
    await giftSystem.rechazarRegalo(
        id,
        interaction.user.id
    );



    if(!regalo){

        return interaction.reply({

            content:
            "❌ Ese regalo ya no existe.",

            ephemeral:true

        });

    }



    await interaction.reply({

        content:
`
❌ Regalo rechazado

📦 ${regalo.item} x${regalo.amount}

Fue devuelto al usuario.
`,

        ephemeral:true

    });


}





module.exports={

    mostrarSeleccionRegalo,

    aceptar,

    rechazar

};