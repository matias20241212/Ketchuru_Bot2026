const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const restrictManager = require("../systems/restrict/restrictManager");

const RESTRICT_ADMIN_ROLE = "1465524197085155420";

const USERS_PER_PAGE = 5;
const PANEL_TIMEOUT = 15 * 60 * 1000;

// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatDate(date) {
    if (!date) {
        return "Desconocida";
    }

    return new Date(date).toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// ============================================================
// FORMATEAR TIEMPO RESTANTE
// ============================================================

function formatRemaining(expiresAt) {

    if (!expiresAt) {
        return "Sin expiración";
    }

    const difference =
        new Date(expiresAt).getTime() - Date.now();

    if (difference <= 0) {
        return "Expirada";
    }

    const seconds = Math.floor(difference / 1000);

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(
        (seconds % 86400) / 3600
    );
    const minutes = Math.floor(
        (seconds % 3600) / 60
    );

    const parts = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (parts.length === 0) {
        return "<1m";
    }

    return parts.join(" ");
}

// ============================================================
// OBTENER SERVIDORES DEL USUARIO
// ============================================================
//
// Busca globalmente en todos los servidores donde está
// KetchuruBot.
//
// Si el usuario no está en ningún servidor, se indica.
// ============================================================

async function getUserGuilds(client, userId) {

    const guilds = [];

    for (const guild of client.guilds.cache.values()) {

        try {

            const member =
                guild.members.cache.get(userId) ||
                await guild.members.fetch(userId);

            if (member) {
                guilds.push(guild);
            }

        } catch {
            // El usuario no está en este servidor.
        }
    }

    return guilds;
}

// ============================================================
// OBTENER DATOS DEL USUARIO
// ============================================================

async function getUserData(client, userId) {

    let user = null;

    try {
        user = await client.users.fetch(userId);
    } catch {
        // El usuario puede seguir existiendo aunque
        // Discord no permita obtener su perfil.
    }

    const guilds = await getUserGuilds(
        client,
        userId
    );

    return {
        user,
        guilds
    };
}

// ============================================================
// CREAR TEXTO DE SERVIDORES
// ============================================================

function formatGuilds(guilds) {

    if (!guilds || guilds.length === 0) {
        return "⚫ No está en ningún servidor con KetchuruBot";
    }

    const maxGuilds = 3;

    const visibleGuilds =
        guilds
            .slice(0, maxGuilds)
            .map(guild => `🟢 ${guild.name}`);

    if (guilds.length > maxGuilds) {
        visibleGuilds.push(
            `➕ ${guilds.length - maxGuilds} servidor(es) más`
        );
    }

    return visibleGuilds.join("\n");
}

// ============================================================
// CREAR BOTONES
// ============================================================

function createButtons(page, totalPages, ownerId) {

    const previousButton = new ButtonBuilder()
        .setCustomId(
            `restrictusers_prev_${ownerId}_${page}`
        )
        .setLabel("Anterior")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0);

    const refreshButton = new ButtonBuilder()
        .setCustomId(
            `restrictusers_refresh_${ownerId}_${page}`
        )
        .setLabel("Actualizar")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
        .setCustomId(
            `restrictusers_next_${ownerId}_${page}`
        )
        .setLabel("Siguiente")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1);

    return new ActionRowBuilder().addComponents(
        previousButton,
        refreshButton,
        nextButton
    );
}

// ============================================================
// GENERAR PANEL
// ============================================================

async function generatePanel(
    client,
    restrictions,
    page
) {

    const totalUsers = restrictions.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalUsers / USERS_PER_PAGE
            )
        );

    if (page < 0) {
        page = 0;
    }

    if (page >= totalPages) {
        page = totalPages - 1;
    }

    // ========================================================
    // SIN RESTRICCIONES
    // ========================================================

    if (totalUsers === 0) {

        return {
            content:
                "🔒 **RESTRICCIONES GLOBALES DE KETCHURUBOT**\n\n" +
                "📊 **Usuarios restringidos:** `0`\n\n" +
                "✅ No hay usuarios restringidos actualmente.",
            components: []
        };
    }

    // ========================================================
    // USUARIOS DE LA PÁGINA
    // ========================================================

    const start =
        page * USERS_PER_PAGE;

    const pageUsers =
        restrictions.slice(
            start,
            start + USERS_PER_PAGE
        );

    let content =
        "🔒 **RESTRICCIONES GLOBALES DE KETCHURUBOT**\n\n" +
        `📊 **Usuarios restringidos:** \`${totalUsers}\`\n` +
        `📄 **Página:** \`${page + 1}/${totalPages}\`\n\n`;

    // ========================================================
    // CREAR CADA USUARIO
    // ========================================================

    for (let index = 0; index < pageUsers.length; index++) {

        const restriction = pageUsers[index];

        const position =
            start + index + 1;

        const data =
            await getUserData(
                client,
                restriction.user_id
            );

        const userMention =
            `<@${restriction.user_id}>`;

        const username =
            data.user
                ? data.user.tag
                : "Usuario no encontrado";

        const type =
            restriction.type === "permanent"
                ? "🔴 Permanente"
                : "🟠 Temporal";

        const appeal =
            restriction.type === "permanent"
                ? (
                    restriction.appeal === true
                        ? "Sí"
                        : "No"
                )
                : "No disponible";

        content +=
            `**${position}.- ${userMention}**\n` +
            `> 👤 **Usuario:** ${username}\n` +
            `> 🆔 **ID:** \`${restriction.user_id}\`\n` +
            `> 🏠 **Servidores:**\n${formatGuilds(data.guilds)}\n` +
            `> 🔒 **Tipo:** ${type}\n` +
            `> 📅 **Restringido:** ${formatDate(restriction.created_at)}\n`;

        if (restriction.type === "permanent") {

            content +=
                `> ♾️ **Expiración:** Nunca\n`;

        } else {

            content +=
                `> ⏰ **Expira:** ${formatDate(restriction.expires_at)}\n` +
                `> ⏳ **Tiempo restante:** ${formatRemaining(restriction.expires_at)}\n`;
        }

        content +=
            `> 📝 **Razón:** ${restriction.reason}\n` +
            `> 📨 **Apelación:** ${appeal}\n\n`;
    }

    return {
        content,
        components: [
            createButtons(
                page,
                totalPages,
                null
            )
        ]
    };
}

// ============================================================
// REEMPLAZAR OWNER ID DE LOS BOTONES
// ============================================================

function applyOwnerToComponents(
    components,
    ownerId,
    page
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                components.length > 0
                    ? 1
                    : 1
            )
        );

    return [
        createButtons(
            page,
            totalPages,
            ownerId
        )
    ];
}

// ============================================================
// CONSTRUIR PANEL CORRECTAMENTE
// ============================================================

async function buildPanel(
    client,
    restrictions,
    page,
    ownerId
) {

    const totalUsers =
        restrictions.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalUsers / USERS_PER_PAGE
            )
        );

    if (page < 0) {
        page = 0;
    }

    if (page >= totalPages) {
        page = totalPages - 1;
    }

    if (totalUsers === 0) {

        return {
            content:
                "🔒 **RESTRICCIONES GLOBALES DE KETCHURUBOT**\n\n" +
                "📊 **Usuarios restringidos:** `0`\n\n" +
                "✅ No hay usuarios restringidos actualmente.",
            components: []
        };
    }

    const start =
        page * USERS_PER_PAGE;

    const pageUsers =
        restrictions.slice(
            start,
            start + USERS_PER_PAGE
        );

    let content =
        "🔒 **RESTRICCIONES GLOBALES DE KETCHURUBOT**\n\n" +
        `📊 **Usuarios restringidos:** \`${totalUsers}\`\n` +
        `📄 **Página:** \`${page + 1}/${totalPages}\`\n\n`;

    for (let index = 0; index < pageUsers.length; index++) {

        const restriction =
            pageUsers[index];

        const position =
            start + index + 1;

        const data =
            await getUserData(
                client,
                restriction.user_id
            );

        const userMention =
            `<@${restriction.user_id}>`;

        const username =
            data.user
                ? data.user.tag
                : "Usuario no encontrado";

        const type =
            restriction.type === "permanent"
                ? "🔴 Permanente"
                : "🟠 Temporal";

        const appeal =
            restriction.type === "permanent"
                ? (
                    restriction.appeal === true
                        ? "Sí"
                        : "No"
                )
                : "No disponible";

        content +=
            `**${position}.- ${userMention}**\n` +
            `> 👤 **Usuario:** ${username}\n` +
            `> 🆔 **ID:** \`${restriction.user_id}\`\n` +
            `> 🏠 **Servidores:**\n${formatGuilds(data.guilds)}\n` +
            `> 🔒 **Tipo:** ${type}\n` +
            `> 📅 **Restringido:** ${formatDate(restriction.created_at)}\n`;

        if (restriction.type === "permanent") {

            content +=
                `> ♾️ **Expiración:** Nunca\n`;

        } else {

            content +=
                `> ⏰ **Expira:** ${formatDate(restriction.expires_at)}\n` +
                `> ⏳ **Tiempo restante:** ${formatRemaining(restriction.expires_at)}\n`;
        }

        content +=
            `> 📝 **Razón:** ${restriction.reason}\n` +
            `> 📨 **Apelación:** ${appeal}\n\n`;
    }

    return {
        content,
        components: [
            createButtons(
                page,
                totalPages,
                ownerId
            )
        ]
    };
}

// ============================================================
// MOSTRAR PANEL
// ============================================================

async function showPanel(
    client,
    target,
    ownerId,
    page = 0
) {

    const restrictions =
        await restrictManager.getAllRestrictions();

    const panel =
        await buildPanel(
            client,
            restrictions,
            page,
            ownerId
        );

    if (target.isChatInputCommand?.()) {

        await target.reply({
            content: panel.content,
            components: panel.components,
            ephemeral: true
        });

        return target.fetchReply();

    }

    return target.reply({
        content: panel.content,
        components: panel.components
    });
}

// ============================================================
// COMANDO DE MENSAJE
// ============================================================

async function ejecutarRestrictUsers(
    message
) {

    try {

        if (!message.guild || !message.member) {
            return message.reply(
                "❌ Este comando solamente puede utilizarse dentro de un servidor."
            );
        }

        if (
            !message.member.roles.cache.has(
                RESTRICT_ADMIN_ROLE
            )
        ) {
            return message.reply(
                "❌ No tienes permiso para utilizar este comando."
            );
        }

        const panel =
            await showPanel(
                message.client,
                message,
                message.author.id,
                0
            );

        createCollector(
            panel,
            message.client,
            message.author.id
        );

    } catch (error) {

        console.error(
            "❌ Error en !restrictusers:",
            error
        );

        return message.reply(
            "❌ Ocurrió un error al cargar las restricciones."
        );
    }
}

// ============================================================
// COMANDO SLASH
// ============================================================

async function ejecutarRestrictUsersSlash(
    interaction
) {

    try {

        if (!interaction.guild || !interaction.member) {
            return interaction.reply({
                content:
                    "❌ Este comando solamente puede utilizarse dentro de un servidor.",
                ephemeral: true
            });
        }

        if (
            !interaction.member.roles.cache.has(
                RESTRICT_ADMIN_ROLE
            )
        ) {
            return interaction.reply({
                content:
                    "❌ No tienes permiso para utilizar este comando.",
                ephemeral: true
            });
        }

        const panel =
            await showPanel(
                interaction.client,
                interaction,
                interaction.user.id,
                0
            );

        createCollector(
            panel,
            interaction.client,
            interaction.user.id
        );

    } catch (error) {

        console.error(
            "❌ Error en /restrictusers:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            return interaction.followUp({
                content:
                    "❌ Ocurrió un error al cargar las restricciones.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Ocurrió un error al cargar las restricciones.",
            ephemeral: true
        });
    }
}

// ============================================================
// COLECTOR DE BOTONES
// ============================================================

function createCollector(
    panelMessage,
    client,
    ownerId
) {

    if (!panelMessage) {
        return;
    }

    const collector =
        panelMessage.createMessageComponentCollector({
            time: PANEL_TIMEOUT
        });

    collector.on(
        "collect",
        async interaction => {

            try {

                // ====================================================
                // SOLO EL USUARIO QUE ABRIÓ EL PANEL
                // ====================================================

                if (
                    interaction.user.id !== ownerId
                ) {

                    return interaction.reply({
                        content:
                            "❌ Este panel solamente puede ser utilizado por quien lo abrió.",
                        ephemeral: true
                    });
                }

                const parts =
                    interaction.customId.split("_");

                if (
                    parts[0] !== "restrictusers"
                ) {
                    return;
                }

                const action = parts[1];

                const oldPage =
                    Number(parts[3]);

                let page = oldPage;

                // ====================================================
                // OBTENER DATOS ACTUALIZADOS
                // ====================================================

                let restrictions =
                    await restrictManager.getAllRestrictions();

                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            restrictions.length /
                            USERS_PER_PAGE
                        )
                    );

                // ====================================================
                // SIGUIENTE
                // ====================================================

                if (action === "next") {

                    if (
                        page <
                        totalPages - 1
                    ) {
                        page++;
                    }
                }

                // ====================================================
                // ANTERIOR
                // ====================================================

                else if (
                    action === "prev"
                ) {

                    if (page > 0) {
                        page--;
                    }
                }

                // ====================================================
                // ACTUALIZAR
                // ====================================================

                else if (
                    action === "refresh"
                ) {

                    if (
                        page >= totalPages
                    ) {
                        page =
                            totalPages - 1;
                    }
                }

                const panel =
                    await buildPanel(
                        client,
                        restrictions,
                        page,
                        ownerId
                    );

                await interaction.update({
                    content: panel.content,
                    components: panel.components
                });

            } catch (error) {

                console.error(
                    "❌ Error en botones de !restrictusers:",
                    error
                );

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    return interaction.followUp({
                        content:
                            "❌ Ocurrió un error al actualizar el panel.",
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    content:
                        "❌ Ocurrió un error al actualizar el panel.",
                    ephemeral: true
                });
            }
        }
    );

    collector.on(
        "end",
        async () => {

            try {

                const disabledRow =
                    new ActionRowBuilder().addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `restrictusers_expired_${ownerId}_0`
                            )
                            .setLabel("Panel expirado")
                            .setEmoji("🔒")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );

                await panelMessage.edit({
                    components: [disabledRow]
                });

            } catch {
                // El mensaje pudo haber sido eliminado.
            }
        }
    );
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    nombre: "restrictusers",
    name: "restrictusers",

    data: new SlashCommandBuilder()
        .setName("restrictusers")
        .setDescription(
            "Muestra todas las restricciones globales de KetchuruBot."
        ),

    ejecutar: ejecutarRestrictUsers,
    execute: ejecutarRestrictUsersSlash
};