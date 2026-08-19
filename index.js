// ============================================================
// 🔐 ENV
// ============================================================

require("dotenv").config();

// ============================================================
// 📦 IMPORTACIONES
// ============================================================

const rankingAPI = require("./Web/api/ranking.js");

const express = require("express");
const db = require("./database");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const {
    Client,
    GatewayIntentBits
} = require("discord.js");

// ============================================================
// 🌐 SERVIDOR WEB
// ============================================================

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "Web")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "Web",
            "pages",
            "dashboard.html"
        )
    );
});

app.use("/api", rankingAPI);

app.listen(PORT, () => {
    console.log(
        `🌐 Servidor iniciado en el puerto ${PORT}`
    );
});

// ============================================================
// 🤖 CLIENTE DISCORD
// ============================================================

const client = new Client({

    // Un solo shard: Shard 0
    shardCount: 1,
    shards: [0],

    intents: [

        // Servidores
        GatewayIntentBits.Guilds,

        // Mensajes
        GatewayIntentBits.GuildMessages,

        // Leer contenido de mensajes
        GatewayIntentBits.MessageContent,

        // Entradas / salidas de miembros
        GatewayIntentBits.GuildMembers

    ]

});

// ============================================================
// 📦 COMANDOS
// ============================================================

require("./handlers/comandos")(client);

// ============================================================
// 👋 BIENVENIDAS / DESPEDIDAS
// ============================================================

const {
    bienvenida,
    despedida
} = require("./systems/bienvenidas/bienvenida");

client.on(
    "guildMemberAdd",
    async (member) => {

        try {

            console.log(
                `👋 NUEVO MIEMBRO: ${member.user.tag}`
            );

            await bienvenida(member);

        } catch (error) {

            console.error(
                "❌ Error en bienvenida:",
                error
            );

        }

    }
);

client.on(
    "guildMemberRemove",
    async (member) => {

        try {

            console.log(
                `👋 MIEMBRO SALIÓ: ${member.user.tag}`
            );

            await despedida(member);

        } catch (error) {

            console.error(
                "❌ Error en despedida:",
                error
            );

        }

    }
);

// ============================================================
// 🎒 INVENTARIO
// ============================================================

let inventory = {};

const inventoryFile = path.join(
    __dirname,
    "data",
    "inventory.json"
);

if (
    fs.existsSync(
        inventoryFile
    )
) {

    try {

        inventory =
            JSON.parse(
                fs.readFileSync(
                    inventoryFile,
                    "utf8"
                )
            );

    } catch (error) {

        console.error(
            "❌ Error cargando inventory.json:",
            error
        );

        inventory = {};

    }

}

async function saveInventory() {

    try {

        await fs.promises.writeFile(
            inventoryFile,
            JSON.stringify(
                inventory,
                null,
                2
            )
        );

    } catch (error) {

        console.error(
            "❌ Error guardando inventario:",
            error
        );

    }

}

// ============================================================
// 📦 SISTEMAS
// ============================================================

const feriaButtons =
    require("./handlers/buttons");

const {
    restockShop
} = require("./systems/shop");

const {
    avanzarMision
} = require("./systems/missionProgress");

const giftButtons =
    require("./systems/gifts/giftButtons");

const giftSystem =
    require("./systems/gifts/giftSystem");

// ============================================================
// 🇨🇱 HORA CHILE
// ============================================================

function getChileDate() {

    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "America/Santiago",

                weekday:
                    "short",

                hour:
                    "numeric",

                hour12:
                    false
            }
        );

    const parts =
        formatter.formatToParts(
            new Date()
        );

    const weekday =
        parts.find(
            part =>
                part.type ===
                "weekday"
        )?.value;

    let hour =
        Number(
            parts.find(
                part =>
                    part.type ===
                    "hour"
            )?.value
        );

    if (
        hour === 24
    ) {
        hour = 0;
    }

    const days = {

        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6

    };

    return {

        day:
            days[weekday],

        hour

    };

}

// ============================================================
// 👇 ADMIN ABUSE
// ============================================================

function getAdminAbuseTime() {

    return {

        saturday: 15,
        tuesday: 20

    };

}

// ============================================================
// 🚨 EVENTOS DE DISCORD
// ============================================================

client.on(
    "debug",
    (info) => {

        console.log(
            "🔎 DISCORD DEBUG:",
            info
        );

    }
);

client.on(
    "warn",
    (warning) => {

        console.warn(
            "⚠️ DISCORD WARN:",
            warning
        );

    }
);

client.on(
    "error",
    (error) => {

        console.error(
            "❌ ERROR DEL CLIENTE DISCORD:",
            error
        );

    }
);

client.on(
    "shardError",
    (error, shardId) => {

        console.error(
            `❌ ERROR DEL GATEWAY | SHARD ${shardId}:`,
            error
        );

    }
);

client.on(
    "shardDisconnect",
    (event, shardId) => {

        console.error(
            `🔴 GATEWAY DESCONECTADO | SHARD ${shardId} | CÓDIGO: ${event.code}`
        );

    }
);

client.on(
    "shardReconnecting",
    (shardId) => {

        console.warn(
            `🔄 RECONEXIÓN AL GATEWAY | SHARD ${shardId}`
        );

    }
);

client.on(
    "shardReady",
    (shardId) => {

        console.log(
            `🟢 SHARD ${shardId} CONECTADO CORRECTAMENTE`
        );

    }
);

client.on(
    "invalidated",
    () => {

        console.error(
            "❌ SESIÓN DE DISCORD INVALIDADA"
        );

    }
);

// ============================================================
// 🟢 BOT CONECTADO
// ============================================================

client.once(
    "clientReady",
    () => {

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.log(
            `✅ KETCHURUBOT CONECTADO COMO: ${client.user.tag}`
        );

        console.log(
            `🆔 ID DEL BOT: ${client.user.id}`
        );

        console.log(
            `🏠 SERVIDORES: ${client.guilds.cache.size}`
        );

        console.log(
            `🧩 SHARD ACTIVO: ${client.shard?.ids?.join(", ") ?? "0"}`
        );

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        // ====================================================
        // 🛒 SHOP RESTOCK
        // ====================================================

        setInterval(
            () => {

                try {

                    const {
                        day,
                        hour
                    } =
                        getChileDate();

                    let shouldRestock =
                        false;

                    // 🟡 LUNES - JUEVES
                    if (
                        day >= 1 &&
                        day <= 4 &&
                        hour === 20
                    ) {

                        shouldRestock =
                            true;

                    }

                    // 🔵 VIERNES
                    if (
                        day === 5 &&
                        (
                            hour === 8 ||
                            hour === 20
                        )
                    ) {

                        shouldRestock =
                            true;

                    }

                    // 🔴 SÁBADO
                    if (
                        day === 6 &&
                        hour % 6 === 0
                    ) {

                        shouldRestock =
                            true;

                    }

                    // 🟢 DOMINGO
                    if (
                        day === 0 &&
                        (
                            hour === 8 ||
                            hour === 20
                        )
                    ) {

                        shouldRestock =
                            true;

                    }

                    if (
                        shouldRestock
                    ) {

                        restockShop();

                        console.log(
                            "🛒 HAMMER TIME RESTOCK"
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Error en restock:",
                        error
                    );

                }

            },

            60 *
            60 *
            1000

        );

        // ====================================================
        // 👇 ADMIN ABUSE
        // ====================================================

        cron.schedule(
            "0 * * * *",
            async () => {

                try {

                    const channel =
                        client.channels.cache.get(
                            "1512250127518011613"
                        );

                    if (
                        !channel
                    ) {
                        return;
                    }

                    const {
                        saturday,
                        tuesday
                    } =
                        getAdminAbuseTime();

                    const now =
                        new Date();

                    const day =
                        now.getUTCDay();

                    const hour =
                        now.getUTCHours();

                    // SÁBADO - 12 HORAS ANTES
                    if (
                        day === 6 &&
                        hour ===
                        saturday - 12
                    ) {

                        await channel.send(
                            "⏰ 12 HORAS PARA ADMIN ABUSE (sábado) - 15:00 UTC"
                        );

                    }

                    // MARTES - 12 HORAS ANTES
                    if (
                        day === 2 &&
                        hour ===
                        tuesday - 12
                    ) {

                        await channel.send(
                            "⏰ 12 HORAS PARA ADMIN ABUSE (martes) - 20:00 UTC"
                        );

                    }

                    // SÁBADO - INICIO
                    if (
                        day === 6 &&
                        hour === saturday
                    ) {

                        await channel.send(
                            "🔥 ADMIN ABUSE INICIADO (sábado) 15:00 UTC (Hammer time)"
                        );

                    }

                    // MARTES - INICIO
                    if (
                        day === 2 &&
                        hour === tuesday
                    ) {

                        await channel.send(
                            "🔥 ADMIN ABUSE INICIADO (martes) 20:00 UTC (Hammer time)"
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Error en Admin Abuse:",
                        error
                    );

                }

            }
        );

    }
);

// ============================================================
// 💬 MENSAJES
// ============================================================

const mensajes =
    new Map();

const statsServidor =
    new Map();

client.on(
    "messageCreate",
    async (message) => {

        try {

            // IGNORAR BOTS
            if (
                message.author.bot
            ) {
                return;
            }

            // IGNORAR PRIVADOS
            if (
                !message.guild
            ) {
                return;
            }

            const guildId =
                message.guild.id;

            const userId =
                message.author.id;

            // =================================================
            // 💰 CREAR USUARIO
            // =================================================

            await db.query(
                `
                INSERT INTO users (
                    discord_id,
                    balance
                )
                VALUES ($1, $2)
                ON CONFLICT (discord_id)
                DO NOTHING
                `,
                [
                    userId,
                    50
                ]
            );

            // =================================================
            // 📅 DAILY STATS
            // =================================================

            try {

                await db.query(
                    `
                    UPDATE daily_stats
                    SET active_today = true
                    WHERE discord_id = $1
                    `,
                    [
                        userId
                    ]
                );

            } catch (error) {

                console.error(
                    "⚠️ Error actualizando daily_stats:",
                    error
                );

            }

            // =================================================
            // 🎯 MISIONES
            // =================================================

            let misionMensaje =
                null;

            try {

                misionMensaje =
                    await avanzarMision(
                        userId,
                        "messages"
                    );

            } catch (error) {

                console.error(
                    "❌ Error avanzando misión:",
                    error
                );

            }

            if (
                misionMensaje
            ) {

                await message.reply(
                    `
🎉 **MISIÓN COMPLETADA**

💬 ${misionMensaje.nombre}

💰 Recompensa:
+${misionMensaje.recompensa} monedas
`
                ).catch(
                    console.error
                );

            }

            // =================================================
            // 🔥 COMANDOS !
            // =================================================

            if (
                message.content.startsWith("!")
            ) {

                const args =
                    message.content
                        .slice(1)
                        .trim()
                        .split(/ +/);

                const commandName =
                    args
                        .shift()
                        .toLowerCase();

                const command =
                    client.commands?.get(
                        commandName
                    );

                if (
                    command
                ) {

                    console.log(
                        `⚡ Ejecutando comando: !${commandName}`
                    );

                    const ejecutar =
                        command.ejecutar ||
                        command.execute;

                    if (
                        typeof ejecutar !==
                        "function"
                    ) {

                        console.error(
                            `❌ El comando !${commandName} no tiene ejecutar/execute`
                        );

                        return;

                    }

                    return ejecutar(
                        message,
                        args,
                        db
                    );

                }

            }

            // =================================================
            // 📊 SISTEMA DE MENSAJES
            // =================================================

            if (
                !mensajes.has(
                    guildId
                )
            ) {

                mensajes.set(
                    guildId,
                    new Map()
                );

            }

            if (
                !statsServidor.has(
                    guildId
                )
            ) {

                statsServidor.set(
                    guildId,
                    {
                        total: 0,
                        firstMessageTime:
                            Date.now()
                    }
                );

            }

            const guildData =
                mensajes.get(
                    guildId
                );

            const serverStats =
                statsServidor.get(
                    guildId
                );

            if (
                !guildData.has(
                    userId
                )
            ) {

                guildData.set(
                    userId,
                    0
                );

            }

            guildData.set(
                userId,
                guildData.get(userId) + 1
            );

            serverStats.total++;

            // =================================================
            // !MENSAJES
            // =================================================

            if (
                message.content ===
                "!mensajes"
            ) {

                const count =
                    guildData.get(
                        userId
                    ) || 0;

                return message.reply(
                    `📊 Has enviado **${count} mensajes** en este servidor`
                );

            }

            // =================================================
            // !TOPMENSAJES
            // =================================================

            if (
                message.content ===
                "!topmensajes"
            ) {

                const sorted =
                    [
                        ...guildData.entries()
                    ]
                        .sort(
                            (a, b) =>
                                b[1] - a[1]
                        )
                        .slice(
                            0,
                            10
                        );

                let text =
                    "🏆 **TOP MENSAJES DEL SERVIDOR**\n\n";

                for (
                    let i = 0;
                    i < sorted.length;
                    i++
                ) {

                    const [
                        targetUserId,
                        count
                    ] =
                        sorted[i];

                    const user =
                        await client.users
                            .fetch(
                                targetUserId
                            )
                            .catch(
                                () => null
                            );

                    text +=
                        `#${i + 1} - ${
                            user
                                ? user.username
                                : "Usuario"
                        }: ${count} mensajes\n`;

                }

                return message.reply(
                    text
                );

            }

            // =================================================
            // !STATS
            // =================================================

            if (
                message.content ===
                "!stats"
            ) {

                const total =
                    serverStats.total;

                const dias =
                    Math.max(
                        1,
                        Math.floor(
                            (
                                Date.now() -
                                serverStats.firstMessageTime
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        )
                    );

                const promedio =
                    (
                        total /
                        dias
                    ).toFixed(2);

                return message.reply(
                    `📊 **ESTADÍSTICAS DEL SERVIDOR**\n\n` +
                    `💬 Mensajes totales: ${total}\n` +
                    `📅 Días activos: ${dias}\n` +
                    `📈 Promedio por día: ${promedio}`
                );

            }

        } catch (error) {

            console.error(
                "❌ ERROR EN messageCreate:",
                error
            );

        }

    }
);

// ============================================================
// 🎁 INTERACCIONES
// ============================================================

client.on(
    "interactionCreate",
    async (interaction) => {

        try {

            // =================================================
            // 🔘 BOTONES
            // =================================================

            if (
                interaction.isButton()
            ) {

                // =================================================
                // 🎪 FERIA
                // =================================================

                if (

                    interaction.customId ===
                        "confirmar_createferia" ||

                    interaction.customId ===
                        "cancelar_createferia" ||

                    interaction.customId.startsWith(
                        "feria_comprar_"
                    ) ||

                    interaction.customId.startsWith(
                        "feria_poder_"
                    ) ||

                    interaction.customId.startsWith(
                        "feria_cancelar_"
                    )

                ) {

                    return feriaButtons(
                        interaction
                    );

                }

                // =================================================
                // 🎁 ACEPTAR REGALO
                // =================================================

                if (
                    interaction.customId ===
                    "gift_accept"
                ) {

                    try {

                        const regalos =
                            await giftSystem
                                .obtenerRegalos(
                                    interaction.user.id
                                );

                        return giftButtons
                            .mostrarSeleccionRegalo(
                                interaction,
                                regalos,
                                "accept"
                            );

                    } catch (error) {

                        console.error(
                            "❌ ERROR GIFT ACCEPT:",
                            error
                        );

                        if (
                            !interaction.replied &&
                            !interaction.deferred
                        ) {

                            return interaction.reply(
                                {
                                    content:
                                        "❌ No se pudieron cargar los regalos.",
                                    ephemeral:
                                        true
                                }
                            );

                        }

                    }

                }

                // =================================================
                // 🎁 RECHAZAR REGALO
                // =================================================

                if (
                    interaction.customId ===
                    "gift_reject"
                ) {

                    try {

                        const regalos =
                            await giftSystem
                                .obtenerRegalos(
                                    interaction.user.id
                                );

                        return giftButtons
                            .mostrarSeleccionRegalo(
                                interaction,
                                regalos,
                                "reject"
                            );

                    } catch (error) {

                        console.error(
                            "❌ ERROR GIFT REJECT:",
                            error
                        );

                        if (
                            !interaction.replied &&
                            !interaction.deferred
                        ) {

                            return interaction.reply(
                                {
                                    content:
                                        "❌ No se pudieron cargar los regalos.",
                                    ephemeral:
                                        true
                                }
                            );

                        }

                    }

                }

                // =================================================
                // ⭐ REPUTACIÓN
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "review_"
                    )
                ) {

                    const estrellas =
                        Number(
                            interaction.customId
                                .split("_")[1]
                        );

                    return interaction.reply(
                        {
                            content:
                                `⭐ Elegiste ${estrellas} estrellas.\n\nAhora escribe tu comentario.`,
                            ephemeral:
                                true
                        }
                    );

                }

                // =================================================
                // 🎒 INVENTARIO
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "inv_item"
                    )
                ) {

                    const data =
                        interaction.customId
                            .split("_");

                    const ownerId =
                        data[2];

                    const page =
                        Number(
                            data[3]
                        );

                    const index =
                        Number(
                            data[4]
                        );

                    if (
                        interaction.user.id !==
                        ownerId
                    ) {

                        return interaction.reply(
                            {
                                content:
                                    "⚠️ Este inventario no es tuyo.",
                                ephemeral:
                                    true
                            }
                        );

                    }

                    const {
                        getInventory
                    } =
                        require(
                            "./systems/inventory"
                        );

                    const {
                        paginate
                    } =
                        require(
                            "./systems/inventorySystem"
                        );

                    const {
                        createUseMenu
                    } =
                        require(
                            "./systems/inventoryUseMenu"
                        );

                    await interaction.deferReply(
                        {
                            ephemeral:
                                true
                        }
                    );

                    const items =
                        await getInventory(
                            interaction.user.id
                        );

                    const current =
                        paginate(
                            items,
                            page,
                            10
                        );

                    const objeto =
                        current[index];

                    if (
                        !objeto
                    ) {

                        return interaction.editReply(
                            {
                                content:
                                    "❌ No existe ese objeto.",
                                components:
                                    []
                            }
                        );

                    }

                    const {
                        setInventoryState
                    } =
                        require(
                            "./systems/inventoryMenu"
                        );

                    setInventoryState(
                        interaction.user.id,
                        {
                            ownerId,
                            item:
                                objeto.item
                        }
                    );

                    return interaction.editReply(
                        {
                            content:
                                `
🎒 **Objeto seleccionado**

${objeto.emoji || "📦"} **${objeto.item}**

📦 Cantidad:
${objeto.amount}

¿Cuántos quieres usar?
`,
                            components:
                                createUseMenu(
                                    objeto.item
                                )
                        }
                    );

                }

                // =================================================
                // ⚡ USAR ITEM
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "use_"
                    )
                ) {

                    const data =
                        interaction.customId
                            .split("_");

                    const accion =
                        data[1];

                    const {
                        getInventoryState
                    } =
                        require(
                            "./systems/inventoryMenu"
                        );

                    const {
                        removeItem
                    } =
                        require(
                            "./systems/inventory"
                        );

                    const state =
                        getInventoryState(
                            interaction.user.id
                        );

                    if (
                        !state
                    ) {

                        return interaction.reply(
                            {
                                content:
                                    "⚠️ Inventario cerrado.",
                                ephemeral:
                                    true
                            }
                        );

                    }

                    // CANCELAR
                    if (
                        accion ===
                        "cancel"
                    ) {

                        return interaction.update(
                            {
                                content:
                                    "❌ Acción cancelada.",
                                components:
                                    []
                            }
                        );

                    }

                    let cantidad =
                        1;

                    // 3 ITEMS
                    if (
                        accion ===
                        "three"
                    ) {

                        cantidad =
                            3;

                    }

                    // PERSONALIZADO
                    if (
                        accion ===
                        "custom"
                    ) {

                        const {
                            ModalBuilder,
                            TextInputBuilder,
                            TextInputStyle,
                            ActionRowBuilder
                        } =
                            require(
                                "discord.js"
                            );

                        const modal =
                            new ModalBuilder()
                                .setCustomId(
                                    "modal_use"
                                )
                                .setTitle(
                                    "Cantidad a usar"
                                );

                        const input =
                            new TextInputBuilder()
                                .setCustomId(
                                    "cantidad"
                                )
                                .setLabel(
                                    "Cantidad"
                                )
                                .setStyle(
                                    TextInputStyle.Short
                                )
                                .setRequired(
                                    true
                                );

                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    input
                                )
                        );

                        return interaction.showModal(
                            modal
                        );

                    }

                    await interaction.deferReply(
                        {
                            ephemeral:
                                true
                        }
                    );

                    await removeItem(
                        interaction.user.id,
                        state.item,
                        cantidad
                    );

                    return interaction.editReply(
                        {
                            content:
                                `✔ Usaste **${cantidad}x ${state.item}**`
                        }
                    );

                }

            }

            // =================================================
            // 🧾 MODAL
            // =================================================

            if (
                interaction.isModalSubmit()
            ) {

                if (
                    interaction.customId !==
                    "modal_use"
                ) {

                    return;

                }

                const {
                    getInventoryState
                } =
                    require(
                        "./systems/inventoryMenu"
                    );

                const {
                    removeItem
                } =
                    require(
                        "./systems/inventory"
                    );

                const cantidad =
                    parseInt(
                        interaction.fields
                            .getTextInputValue(
                                "cantidad"
                            )
                    );

                if (
                    isNaN(cantidad) ||
                    cantidad <= 0
                ) {

                    return interaction.reply(
                        {
                            content:
                                "❌ Cantidad inválida",
                            ephemeral:
                                true
                        }
                    );

                }

                const state =
                    getInventoryState(
                        interaction.user.id
                    );

                if (
                    !state
                ) {

                    return interaction.reply(
                        {
                            content:
                                "⚠️ Inventario cerrado.",
                            ephemeral:
                                true
                        }
                    );

                }

                await interaction.deferReply(
                    {
                        ephemeral:
                            true
                    }
                );

                await removeItem(
                    interaction.user.id,
                    state.item,
                    cantidad
                );

                return interaction.editReply(
                    {
                        content:
                            `✔ Usaste **${cantidad}x ${state.item}**`
                    }
                );

            }

        } catch (error) {

            console.error(
                "❌ ERROR EN interactionCreate:",
                error
            );

            try {

                if (
                    interaction.deferred
                ) {

                    await interaction.editReply(
                        {
                            content:
                                "❌ Ocurrió un error procesando esta interacción."
                        }
                    );

                } else if (
                    !interaction.replied
                ) {

                    await interaction.reply(
                        {
                            content:
                                "❌ Ocurrió un error procesando esta interacción.",
                            ephemeral:
                                true
                        }
                    );

                }

            } catch (replyError) {

                console.error(
                    "❌ No se pudo responder a la interacción:",
                    replyError
                );

            }

        }

    }
);

// ============================================================
// 🔑 LOGIN DISCORD
// ============================================================

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);

console.log(
    "🔑 Token de Discord:",
    process.env.TOKEN
        ? "DETECTADO"
        : "❌ NO DETECTADO"
);

console.log(
    "🧩 Shard configurado: 0"
);

console.log(
    "🔌 Intentando conectar con Discord Gateway..."
);

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);

if (
    !process.env.TOKEN
) {

    console.error(
        "❌ ERROR CRÍTICO: TOKEN NO ENCONTRADO."
    );

    process.exit(1);

}

client.login(
    process.env.TOKEN
)
.then(
    () => {

        console.log(
            "🔐 client.login() ejecutado correctamente."
        );

    }
)
.catch(
    (error) => {

        console.error(
            "❌❌❌ ERROR AL INICIAR DISCORD ❌❌❌"
        );

        console.error(
            error
        );

    }
);