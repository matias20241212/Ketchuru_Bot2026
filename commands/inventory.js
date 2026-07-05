const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { inventory } = require("../systems/inventory"); // tu data

module.exports = {
name: "inventario",

async execute(message) {

    const userId = message.author.id;
    const userInv = inventory[userId] || {};

    if (Object.keys(userInv).length === 0) {
        return message.reply("🎒 Tu inventario está vacío.");
    }

    const items = Object.entries(userInv);

    const embed = new EmbedBuilder()
        .setTitle("🎒 Inventario")
        .setDescription(
            items.map(([item, qty], i) =>
                `**${i + 1}. ${item}** x${qty}`
            ).join("\n")
        );

    const row = new ActionRowBuilder().addComponents(
        items.slice(0, 5).map(([item]) =>
            new ButtonBuilder()
                .setCustomId(`inv_${message.author.id}_${item}`)
                .setLabel(item)
                .setStyle(ButtonStyle.Primary)
        )
    );

    return message.reply({ embeds: [embed], components: [row] });
}
};