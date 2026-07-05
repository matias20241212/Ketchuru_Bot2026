const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { inventory } = require("../../systems/inventory");

module.exports = {
  name: "inventario",

  async execute(message, args) {

    const user =
      message.mentions.users.first() || message.author;

    const isOwn = user.id === message.author.id;

    const userInventory = inventory[user.id];

    if (!userInventory || Object.keys(userInventory).length === 0) {
      return message.reply(
        isOwn
          ? "🎒 Tu inventario está vacío."
          : `🎒 El inventario de **${user.username}** está vacío.`
      );
    }

    let text = `🎒 **Inventario de ${user.username}**\n\n`;

    const row = new ActionRowBuilder();

    let i = 0;

    for (const [item, amount] of Object.entries(userInventory)) {

      text += `• ${item} x${amount}\n`;

      // botones solo si es tu inventario
      if (isOwn && i < 5) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`inv_${message.author.id}_${item}`)
            .setLabel(`${item} x${amount}`)
            .setStyle(ButtonStyle.Secondary)
        );
      }

      i++;
    }

    if (isOwn) {
      return message.reply({
        content: text,
        components: [row]
      });
    }

    return message.reply(text);
  }
};