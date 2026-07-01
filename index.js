require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// -------------------- CONFIG --------------------
const CANAL_ID = "1512250127518011613";

// -------------------- EVENTOS --------------------
const eventos = [
    {
        dia: 2, // martes
        horaBase: 20,
        nombre: "🔥Taco tuesday / Martes de taco (Admin abuse) de steal a brainrot🔥"
    },
    {
        dia: 6, // sábado
        horaBase: 15,
        nombre: "🔥Update / Actualizacion (Admin abuse) de steal a brainrot🔥"
    }
];

// -------------------- AFK --------------------
const estados = new Map();

// -------------------- FUNCIONES --------------------
function esPrimerSabado(fecha) {
    return fecha.getUTCDay() === 6 && fecha.getUTCDate() <= 7;
}

function obtenerOffset(fecha) {
    const mes = fecha.getUTCMonth();
    let offsetSur = 0;

    if (mes === 3 && esPrimerSabado(fecha)) offsetSur = -1;
    if (mes === 4 && esPrimerSabado(fecha)) offsetSur = -2;
    if (mes === 8 && esPrimerSabado(fecha)) offsetSur = +1;
    if (mes === 9 && esPrimerSabado(fecha)) offsetSur = +2;

    return offsetSur;
}

function enviarMensaje(texto) {
    const canal = client.channels.cache.get(CANAL_ID);
    if (!canal) return;
    canal.send(texto);
}

// -------------------- READY (SOLO UNO) --------------------
client.once("ready", () => {
    console.log(`✅ Conectado como ${client.user.tag}`);

    setInterval(() => {
        const ahora = new Date();

        const dia = ahora.getUTCDay();
        const hora = ahora.getUTCHours();

        const offset = obtenerOffset(ahora);

        eventos.forEach(evento => {
            const horaEvento = (evento.horaBase + offset + 24) % 24;

            if (dia === evento.dia && hora === horaEvento) {
                enviarMensaje(`🔥 ${evento.nombre} ACTIVADO 🔥`);
            }

            const horaAviso = (horaEvento - 12 + 24) % 24;

            if (dia === evento.dia && hora === horaAviso) {
                enviarMensaje(`⏰ FALTAN 12 HORAS PARA ${evento.nombre}`);
            }
        });

    }, 60 * 1000);
});

// -------------------- COMANDOS --------------------
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // AFK
    if (message.content.startsWith("!afk")) {
        const motivo = message.content.slice(4).trim() || "Sin motivo";

        estados.set(message.author.id, {
            nombre: "AFK 💤",
            emoji: "💤",
            motivo,
            inicio: Date.now()
        });

        return message.reply(`💤 Ahora estás AFK.\nMotivo: ${motivo}`);
    }

    // OCUPADO
    if (message.content.startsWith("!ocupado")) {
        const motivo = message.content.slice(8).trim() || "Sin motivo";

        estados.set(message.author.id, {
            nombre: "ocupado 🔴",
            emoji: "🔴",
            motivo,
            inicio: Date.now()
        });

        return message.reply(`🔴 Ahora estás ocupado.\nMotivo: ${motivo}`);
    }

    // ENAMORADO
    if (message.content.startsWith("!enamorado")) {
        estados.set(message.author.id, {
            nombre: "enamorado ❤️",
            emoji: "❤️",
            motivo: "Muy enamorado",
            inicio: Date.now()
        });

        return message.reply("❤️ Ahora apareces como enamorado.");
    }

    // MENCIONES
    for (const user of message.mentions.users.values()) {
        if (estados.has(user.id)) {
            const estado = estados.get(user.id);

            const tiempo = Math.floor((Date.now() - estado.inicio) / 1000);

            const horas = Math.floor(tiempo / 3600);
            const minutos = Math.floor((tiempo % 3600) / 60);
            const segundos = tiempo % 60;

            message.reply(
                `${estado.emoji} ${user.username} está ${estado.nombre}\nMotivo: ${estado.motivo}\n⏱️ Lleva ${horas}h ${minutos}m ${segundos}s`
            );
        }
    }

    // VOLVER DE AFK
    if (estados.has(message.author.id)) {
        const estado = estados.get(message.author.id);

        const tiempo = Math.floor((Date.now() - estado.inicio) / 1000);

        const horas = Math.floor(tiempo / 3600);
        const minutos = Math.floor((tiempo % 3600) / 60);
        const segundos = tiempo % 60;

        estados.delete(message.author.id);

        return message.reply(
            `✅ Ya no estás AFK.\n⏱️ Estuviste ${horas}h ${minutos}m ${segundos}s`
        );
    }
});

// -------------------- LOGIN --------------------
client.login(process.env.TOKEN);
