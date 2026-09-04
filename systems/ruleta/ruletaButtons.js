const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


// ============================================================
// 🎰 BOTONES DE RULETA
// ============================================================

function createButtons(userId) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(`ruleta_rojo_${userId}`)
                .setLabel("Rojo")
                .setEmoji("🔴")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(`ruleta_negro_${userId}`)
                .setLabel("Negro")
                .setEmoji("⚫")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`ruleta_verde_${userId}`)
                .setLabel("Verde")
                .setEmoji("🟢")
                .setStyle(ButtonStyle.Success)

        );

}


// ============================================================
// 🔒 BOTÓN DESHABILITADO
// ============================================================

function disableButtons() {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("ruleta_disabled")
                .setLabel("Ruleta terminada")
                .setEmoji("🎰")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)

        );

}


// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {
    createButtons,
    disableButtons
};