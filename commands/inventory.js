const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getInventory } = require("../systems/inventory");

module.exports = {
    name: "inventory",

    async execute(message) {

        const userId = message.author.id;

        const inventory = getInventory(userId);

        const items = Object.entries(inventory);


        if (items.length === 0) {
            return message.reply("🎒 Tu inventario está vacío.");
        }


        let text = "";

        for (const [item, amount] of items) {
            text += `${item} x${amount}\n`;
        }


        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventario de ${message.author.username}`)
            .setDescription(text)
            .setColor("Blue");


        const buttons = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("use_item")
                    .setLabel("🎮 Usar")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("use_amount")
                    .setLabel("🔢 Usar cantidad")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("sell_item")
                    .setLabel("💰 Vender")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("sell_amount")
                    .setLabel("💵 Vender cantidad")
                    .setStyle(ButtonStyle.Secondary)

            );


        message.reply({
            embeds: [embed],
            components: [buttons]
        });

    }
};