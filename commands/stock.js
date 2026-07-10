// ================================
// !stock
// ================================

const STOCK_CHANNEL_ID = "1523399225071894659"; // ID del canal Ketchuru Shop
const STOCK_COOLDOWN = 30 * 60 * 1000; // 30 minutos

const stockCooldowns = new Map();

const ROLES_PERMITIDOS = [
    "1465524197085155420", // 👑 Owner
    "1512618062917144708", // 👪 Hermano
    "1495243561883533342", // ♕ Co Owner
    "1516897210862931978", // 🎥 Youtuber grande (+1M)
    "1516896452889153646", // 🎥 Youtuber Mediano
    "1512179364194947343", // 🎥 Youtuber prometedor
    "1497041324631658586", // 🛡️ Staff
    "1465523926431039610", // 🛠️ MOD | Jefatura
    "1522003060426276905", // 🛠️ MOD | Avanzado
    "1522002541355732992"  // 🛠️ MOD | Principiante
];

if (command === "stock") {

    const bypassCooldown = message.member.roles.cache.some(role =>
        ROLES_PERMITIDOS.includes(role.id)
    );

    if (!bypassCooldown) {

        const ultimoUso = stockCooldowns.get(message.author.id);

        if (ultimoUso) {

            const tiempoRestante = STOCK_COOLDOWN - (Date.now() - ultimoUso);

            if (tiempoRestante > 0) {

                const minutos = Math.floor(tiempoRestante / 60000);
                const segundos = Math.floor((tiempoRestante % 60000) / 1000);

                return message.reply(
                    `⏳ Ya utilizaste **!stock**.\n\nVuelve a intentarlo en **${minutos}m ${segundos}s**.`
                );
            }
        }

        stockCooldowns.set(message.author.id, Date.now());
    }

    const canalStock = client.channels.cache.get(STOCK_CHANNEL_ID);

    if (!canalStock) {
        return message.reply("❌ No pude encontrar el canal de la tienda.");
    }

    const mensajes = await canalStock.messages.fetch({ limit: 1 });

    if (!mensajes.size) {
        return message.reply("❌ No hay ningún stock disponible.");
    }

    const ultimoMensaje = mensajes.first();

    await message.channel.send({
        content: ultimoMensaje.content || undefined,
        embeds: ultimoMensaje.embeds,
        files: [...ultimoMensaje.attachments.values()]
    });

}