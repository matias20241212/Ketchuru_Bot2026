const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


function createInventoryButtons(items, page, totalPages, ownerId) {

    const rows = [];


    const objectButtons = items.map((item, index)=>{

        return new ButtonBuilder()
        .setCustomId(
            `inv_item_${ownerId}_${page}_${index}`
        )
        .setLabel(item.item)
        .setStyle(ButtonStyle.Primary);

    });


    for(let i = 0; i < objectButtons.length; i += 5){

        rows.push(
            new ActionRowBuilder()
            .addComponents(
                objectButtons.slice(i,i+5)
            )
        );

    }


    const navigation = new ActionRowBuilder()
    .addComponents(

        new ButtonBuilder()
        .setCustomId(
            `inv_back_${ownerId}_${page}`
        )
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Secondary),


        new ButtonBuilder()
        .setCustomId(
            `inv_exit_${ownerId}`
        )
        .setEmoji("🚪")
        .setStyle(ButtonStyle.Danger),


        new ButtonBuilder()
        .setCustomId(
            `inv_next_${ownerId}_${page}`
        )
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Secondary)

    );


    rows.push(navigation);


    return rows;
}



module.exports = {
    createInventoryButtons
};