const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


function createUseMenu(id){

    return [

        new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
            .setCustomId(`use_cancel_${id}`)
            .setLabel("❌ Rechazar")
            .setStyle(ButtonStyle.Danger),


            new ButtonBuilder()
            .setCustomId(`use_one_${id}`)
            .setLabel("x1")
            .setStyle(ButtonStyle.Primary),


            new ButtonBuilder()
            .setCustomId(`use_three_${id}`)
            .setLabel("x3")
            .setStyle(ButtonStyle.Primary),


            new ButtonBuilder()
            .setCustomId(`use_custom_${id}`)
            .setLabel("✏️ Personalizar")
            .setStyle(ButtonStyle.Secondary)

        )

    ];

}


module.exports={
    createUseMenu
};