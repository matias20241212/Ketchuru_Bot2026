module.exports = {
    name: "ping",

    async execute(message) {

        const msg = await message.reply("🏓 Calculando...");

        const latency = msg.createdTimestamp - message.createdTimestamp;

        msg.edit(
            `🏓 Pong!\n\n` +
            `📡 Latencia del bot: **${latency}ms**\n` +
            `💙 Discord API: **${message.client.ws.ping}ms**`
        );
    }
};