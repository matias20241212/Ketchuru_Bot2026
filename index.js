const express = require("express");
const app = express();

const cron = require("node-cron");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Ketchuru Bot está online.");
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =========================
// DEBUG
// =========================
client.on('debug', console.log);
client.on('error', console.error);
client.on('warn', console.warn);

// =========================
// READY
// =========================
client.once('ready', () => {
    console.log(`✅ Conectado como ${client.user.tag}`);

    // 🔁 corre cada hora
    cron.schedule('0 * * * *', async () => {

        const channel = client.channels.cache.get("1512250127518011613");
        if (!channel) return;

        const { saturday, tuesday } = getAdminAbuseTime();

        const now = new Date();
        const day = now.getUTCDay(); // 2 martes, 6 sábado
        const hour = now.getUTCHours();

        // =========================
        // 🔥 AVISO 12 HORAS ANTES
        // =========================
        if (day === 6 && hour === (saturday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (sábado) - ${saturday}:00 UTC`);
        }

        if (day === 2 && hour === (tuesday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (martes) - ${tuesday}:00 UTC`);
        }

        // =========================
        // 🔥 AVISO EN EL MOMENTO
        // =========================
        if (day === 6 && hour === saturday) {
            channel.send(`🔥 ADMIN ABUSE INICIADO (sábado) ${saturday}:00 UTC (Hammer time)`);
        }

        if (day === 2 && hour === tuesday) {
            channel.send(`🔥 ADMIN ABUSE INICIADO (martes) ${tuesday}:00 UTC (Hammer time)`);
        }
    });
});

// =========================
// FUNCION HORARIOS
// =========================
function getAdminAbuseTime() {
    const month = new Date().getUTCMonth() + 1;

    let saturday = 16;
    let tuesday = 19;

    if (month === 5) {
        saturday = 15;
        tuesday = 18;
    }

    if (month === 9) {
        saturday = 16;
        tuesday = 19;
    }

    if (month === 10) {
        saturday = 17;
        tuesday = 20;
    }

    return { saturday, tuesday };
}

// =========================
// MENSAJES
// =========================
const mensajes = new Map();
const statsServidor = new Map();

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    if (!mensajes.has(guildId)) {
        mensajes.set(guildId, new Map());
    }

    if (!statsServidor.has(guildId)) {
        statsServidor.set(guildId, {
            total: 0,
            firstMessageTime: Date.now()
        });
    }

    const guildData = mensajes.get(guildId);
    const serverStats = statsServidor.get(guildId);

    if (!guildData.has(userId)) {
        guildData.set(userId, 0);
    }

    guildData.set(userId, guildData.get(userId) + 1);
    serverStats.total++;

    if (message.content === '!mensajes') {
        const count = guildData.get(userId) || 0;
        return message.reply(`📊 Has enviado **${count} mensajes** en este servidor`);
    }

    if (message.content === '!topmensajes') {

        const sorted = [...guildData.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        let text = `🏆 **TOP MENSAJES DEL SERVIDOR**\n\n`;

        for (let i = 0; i < sorted.length; i++) {
            const [userId, count] = sorted[i];
            const user = await client.users.fetch(userId).catch(() => null);

            text += `#${i + 1} - ${user ? user.username : 'Usuario'}: ${count} mensajes\n`;
        }

        return message.reply(text);
    }

    if (message.content === '!stats') {

        const total = serverStats.total;

        const dias = Math.max(
            1,
            Math.floor((Date.now() - serverStats.firstMessageTime) / (1000 * 60 * 60 * 24))
        );

        const promedio = (total / dias).toFixed(2);

        return message.reply(
            `📊 **ESTADÍSTICAS DEL SERVIDOR**\n\n` +
            `💬 Mensajes totales: ${total}\n` +
            `📅 Días activos: ${dias}\n` +
            `📈 Promedio por día: ${promedio}`
        );
    }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);