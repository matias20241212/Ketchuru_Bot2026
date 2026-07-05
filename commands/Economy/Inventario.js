!inventario
!inventario @user

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "inventario",

    async execute(message, args, client, inventory) {

        const userId = message.author.id;

        if (!inventory[userId] || Object.keys(inventory[userId]).length === 0) {
            return message.reply("🎒 Tu inventario está vacío.");
        }

        const items = Object.keys(inventory[userId]);

        const embed = new EmbedBuilder()
            .setTitle("🎒 Inventario")
            .setDescription(
                items.map((item, i) =>
                    `**${i + 1}.** ${item} x${inventory[userId][item]}`
                ).join("\n")
            );

        // BOTONES (máx 5 por fila Discord)
        const row = new ActionRowBuilder();

        items.slice(0, 5).forEach((item, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`inv_${userId}_${item}`)
                    .setLabel(item)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        return message.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
