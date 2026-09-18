const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "ping",

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Muestra la latencia del bot"),

    async execute(ctx) {

        // ============================
        // 🔵 SLASH /PING
        // ============================

        if (ctx.isChatInputCommand?.()) {

            const latency = Date.now() - ctx.createdTimestamp;

            await ctx.reply(
                `🏓 Pong!\n\n` +
                `📡 Latencia del bot: **${latency}ms**\n` +
                `💙 Discord API: **${ctx.client.ws.ping}ms**`
            );

            return;
        }

        // ============================
        // 🟢 COMANDO !PING
        // ============================

        const msg = await ctx.reply("🏓 Calculando...");

        const latency =
            msg.createdTimestamp -
            ctx.createdTimestamp;

        await msg.edit(
            `🏓 Pong!\n\n` +
            `📡 Latencia del bot: **${latency}ms**\n` +
            `💙 Discord API: **${ctx.client.ws.ping}ms**`
        );
    }
};