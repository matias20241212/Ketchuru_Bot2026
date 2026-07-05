const express = require("express");
const app = express();

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

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
// 💰 ECONOMÍA (50 MONEDAS)
// =========================
let balances = {};

const balanceFile = "./data/balance.json";

// cargar balances seguro
if (fs.existsSync(balanceFile)) {
    try {
        balances = JSON.parse(fs.readFileSync(balanceFile));
    } catch (e) {
        balances = {};
    }
}

function saveBalances() {
    fs.writeFileSync(balanceFile, JSON.stringify(balances, null, 2));
}

// =========================
// 🎒 INVENTARIO (PRO)
// =========================
let inventory = {};

const inventoryFile = "./data/inventory.json";

// cargar inventario seguro
if (fs.existsSync(inventoryFile)) {
    try {
        inventory = JSON.parse(fs.readFileSync(inventoryFile));
    } catch (e) {
        inventory = {};
    }
}

function saveInventory() {
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));
}

// =========================
// 🧠 FUNCIONES ECONOMÍA + INVENTARIO
// =========================

// 💰 BALANCE
function addMoney(userId, amount) {
    if (!balances[userId]) balances[userId] = 0;
    balances[userId] += amount;
    saveBalances();
}

function removeMoney(userId, amount) {
    if (!balances[userId]) return false;
    balances[userId] -= amount;
    saveBalances();
}

// 🎒 INVENTARIO
function addItem(userId, item, amount = 1) {
    if (!inventory[userId]) inventory[userId] = {};

    if (!inventory[userId][item]) {
        inventory[userId][item] = 0;
    }

    inventory[userId][item] += amount;
    saveInventory();
}

function removeItem(userId, item, amount = 1) {
    if (!inventory[userId]) return false;
    if (!inventory[userId][item]) return false;

    inventory[userId][item] -= amount;

    if (inventory[userId][item] <= 0) {
        delete inventory[userId][item];
    }

    saveInventory();
}
// =========================
// CARGA DE COMANDOS
// =========================
client.commands = new Map();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

    const commandsPath = path.join(foldersPath, folder);

    // Ignora archivos y solo entra a carpetas
    if (!fs.statSync(commandsPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        client.commands.set(command.name, command);
    }
}
// =========================
// DEBUG
// =========================
client.on('debug', console.log);
client.on('error', console.error);
client.on('warn', console.warn);

// =========================
// READY
// =========================
client.once("ready", () => {

    console.log(`✅ Conectado como ${client.user.tag}`);

    const { checkRestock } = require("./systems/shop");
    const {
        common,
        uncommon,
        rare,
        epic,
        legendary,
        mythic,
        secret_bad,
        secret_medium,
        secret_big,
        og
    } = require("./systems/shopData");

    // =========================
    // 🛒 SHOP RESTOCK SYSTEM
    // =========================
    setInterval(() => {
        checkRestock([
            ...common,
            ...uncommon,
            ...rare,
            ...epic,
            ...legendary,
            ...mythic,
            ...secret_bad,
            ...secret_medium,
            ...secret_big,
            ...og
        ]);
    }, 60000); // cada 1 minuto

    // 👇 TU CÓDIGO YA EXISTENTE (cron)
    cron.schedule('0 * * * *', async () => {

        const channel = client.channels.cache.get("1512250127518011613");
        if (!channel) return;

        const { saturday, tuesday } = getAdminAbuseTime();

        const now = new Date();
        const day = now.getUTCDay();
        const hour = now.getUTCHours();

        if (day === 6 && hour === (saturday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (sábado) - ${saturday}:00 UTC`);
        }

        if (day === 2 && hour === (tuesday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (martes) - ${tuesday}:00 UTC`);
        }

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
// MENSAJES + COMANDOS + ECONOMÍA
// =========================
const mensajes = new Map();
const statsServidor = new Map();

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // =========================
    // 💰 DAR 50 MONEDAS SOLO 1 VEZ
    // =========================
    if (!balances[userId]) {
        balances[userId] = 50;
        saveBalances();
    }

    // =========================
    // 🔥 SISTEMA DE COMANDOS (!)
    // =========================
    if (message.content.startsWith("!")) {

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (command) {
            return command.execute(message, args);
        }
    }

    // =========================
    // TU SISTEMA ACTUAL
    // =========================

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
client.on("interactionCreate", async (interaction) => {

    // =========================
    // 🔘 BOTONES INVENTARIO
    // =========================
    if (interaction.isButton()) {

        const [prefix, ownerId, item] = interaction.customId.split("_");

        if (prefix !== "inv") return;

        const { getInventoryState, setInventoryState } = require("./systems/inventoryMenu");

        // 🔒 BLOQUEO TOTAL
        const state = getInventoryState(interaction.user.id);

        if (!state || state.ownerId !== interaction.user.id) {
            return interaction.reply({
                content: "⚠️ Advertencia: no puedes usar el inventario de otro usuario.",
                ephemeral: true
            });
        }

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: "⚠️ Este inventario no es tuyo.",
                ephemeral: true
            });
        }

        setInventoryState(interaction.user.id, {
            ownerId: interaction.user.id,
            item,
            amount: 1
        });

        const {
            ActionRowBuilder,
            ButtonBuilder,
            ButtonStyle
        } = require("discord.js");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`use_yes_${interaction.user.id}`)
                .setLabel("✅ Usar")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`use_no_${interaction.user.id}`)
                .setLabel("❌ Cancelar")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(`use_x1_${interaction.user.id}`)
                .setLabel("Usar x1")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`use_custom_${interaction.user.id}`)
                .setLabel("Usar x cantidad")
                .setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({
            content: `🎯 Item seleccionado: **${item}**`,
            components: [row],
            ephemeral: true
        });
    }

    // =========================
    // ⚡ USAR ITEM (YES / X1)
    // =========================
    if (
        interaction.customId.startsWith("use_yes_") ||
        interaction.customId.startsWith("use_x1_")
    ) {

        const { getInventoryState } = require("./systems/inventoryMenu");
        const { removeItem } = require("./systems/inventory");

        const state = getInventoryState(interaction.user.id);

        if (!state || state.ownerId !== interaction.user.id) {
            return interaction.reply({
                content: "⚠️ Advertencia: no puedes usar el inventario de otro usuario.",
                ephemeral: true
            });
        }

        removeItem(interaction.user.id, state.item, 1);

        return interaction.reply({
            content: `✔ Usaste 1x **${state.item}**`,
            ephemeral: true
        });
    }

    // =========================
    // ❌ CANCELAR
    // =========================
    if (interaction.customId.startsWith("use_no_")) {
        return interaction.reply({
            content: "❌ Cancelado",
            ephemeral: true
        });
    }

    // =========================
    // 🧾 MODAL
    // =========================
    if (interaction.customId.startsWith("use_custom_")) {

        const {
            ModalBuilder,
            TextInputBuilder,
            TextInputStyle,
            ActionRowBuilder
        } = require("discord.js");

        const modal = new ModalBuilder()
            .setCustomId(`modal_use_${interaction.user.id}`)
            .setTitle("Usar items");

        const input = new TextInputBuilder()
            .setCustomId("cantidad")
            .setLabel("¿Cuántos quieres usar?")
            .setStyle(TextInputStyle.Short);

        const row = new ActionRowBuilder().addComponents(input);

        modal.addComponents(row);

        return interaction.showModal(modal);
    }

    // =========================
    // 🧾 MODAL SUBMIT
    // =========================
    if (interaction.isModalSubmit()) {

        if (!interaction.customId.startsWith("modal_use_")) return;

        const { getInventoryState } = require("./systems/inventoryMenu");
        const { removeItem } = require("./systems/inventory");

        const userId = interaction.user.id;

        const cantidad = parseInt(interaction.fields.getTextInputValue("cantidad"));

        if (isNaN(cantidad) || cantidad <= 0) {
            return interaction.reply({
                content: "❌ Cantidad inválida",
                ephemeral: true
            });
        }

        const state = getInventoryState(userId);

        if (!state || state.ownerId !== userId) {
            return interaction.reply({
                content: "⚠️ Advertencia: no puedes usar inventario de otro usuario.",
                ephemeral: true
            });
        }

        removeItem(userId, state.item, cantidad);

        return interaction.reply({
            content: `✔ Usaste **${cantidad}x ${state.item}**`,
            ephemeral: true
        });
    }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);