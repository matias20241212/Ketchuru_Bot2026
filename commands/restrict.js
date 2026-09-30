const { SlashCommandBuilder } = require("discord.js");

const restrictManager = require("../systems/restrict/restrictManager");

const RESTRICT_ADMIN_ROLE = "1465524197085155420";

async function ejecutarRestrict(message, args) {
    try {
        // =========================================
        // PERMISOS
        // =========================================

        if (!message.guild || !message.member) {
            return message.reply(
                "❌ Este comando solamente puede utilizarse dentro de un servidor."
            );
        }

        if (!message.member.roles.cache.has(RESTRICT_ADMIN_ROLE)) {
            return message.reply(
                "❌ No tienes permiso para utilizar este comando."
            );
        }

        // =========================================
        // ARGUMENTOS
        // =========================================

        if (!args || args.length < 3) {
            return message.reply(
                "❌ Uso correcto:\n" +
                "`!restrict ID/USER TIME REASON [appeal:yes/no]`\n\n" +
                "Ejemplos:\n" +
                "`!restrict @Usuario 7d Spam`\n" +
                "`!restrict @Usuario 1M Spam`\n" +
                "`!restrict @Usuario permanently Abuso appeal:yes`"
            );
        }

        const targetInput = args[0];
        const time = args[1].toLowerCase();

        // =========================================
        // USUARIO / ID
        // =========================================

        let targetUser;

        try {
            targetUser = await message.client.users.fetch(
                targetInput.replace(/[<@!>]/g, "")
            );
        } catch {
            return message.reply(
                "❌ No pude encontrar ese usuario o ID de Discord."
            );
        }

        const userId = targetUser.id;

        // =========================================
        // APPEAL
        // =========================================

        let appeal = null;

        const appealArgument = args.find(arg =>
            arg.toLowerCase().startsWith("appeal:")
        );

        if (appealArgument) {
            const value = appealArgument
                .split(":")
                .slice(1)
                .join(":")
                .toLowerCase();

            if (["yes", "si", "sí"].includes(value)) {
                appeal = true;
            } else if (value === "no") {
                appeal = false;
            } else {
                return message.reply(
                    "❌ El valor de `appeal` debe ser `yes/si` o `no`."
                );
            }
        }

        // =========================================
        // PERMANENTE
        // =========================================

        const permanentValues = [
            "permanently",
            "permanente",
            "permanent"
        ];

        const isPermanent = permanentValues.includes(time);

        // =========================================
        // APPEAL SOLO PERMANENTE
        // =========================================

        if (!isPermanent && appeal !== null) {
            return message.reply(
                "❌ **Esta función no está disponible al no ser permanente.**\n" +
                "La opción `appeal` solamente puede utilizarse en restricciones permanentes."
            );
        }

        // =========================================
        // MOTIVO
        // =========================================

        const reasonParts = args.filter(arg =>
            !arg.toLowerCase().startsWith("appeal:")
        );

        reasonParts.shift();
        reasonParts.shift();

        const reason = reasonParts.join(" ").trim();

        if (!reason) {
            return message.reply(
                "❌ Debes especificar un motivo para la restricción."
            );
        }

        // =========================================
        // DURACIÓN
        // =========================================

        let duration = null;

        if (!isPermanent) {
            duration = restrictManager.parseDuration(time);

            if (!duration) {
                return message.reply(
                    "❌ Duración inválida.\n\n" +
                    "Formatos permitidos:\n" +
                    "`1d` → 1 día\n" +
                    "`7d` → 7 días\n" +
                    "`1M` → 1 mes\n" +
                    "`6M` → 6 meses\n" +
                    "`1y` → 1 año\n" +
                    "`permanently` → permanente"
                );
            }
        }

        // =========================================
        // CREAR RESTRICCIÓN
        // =========================================

        await restrictManager.createRestriction({
            userId,
            type: isPermanent ? "permanent" : "temporary",
            duration,
            reason,
            appeal,
            restrictedBy: message.author.id
        });

        // =========================================
        // RESPUESTA
        // =========================================

        const durationText = isPermanent
            ? "Permanente"
            : time;

        const appealText = isPermanent
            ? (appeal === true ? "Sí" : "No")
            : "No disponible";

        return message.reply(
            "🔒 **Restricción aplicada correctamente.**\n\n" +
            `**Usuario:** ${targetUser.tag}\n` +
            `**ID:** \`${userId}\`\n` +
            `**Duración:** ${durationText}\n` +
            `**Motivo:** ${reason}\n` +
            `**Apelación:** ${appealText}`
        );

    } catch (error) {
        console.error("❌ Error en !restrict:", error);

        return message.reply(
            "❌ Ocurrió un error al intentar aplicar la restricción."
        );
    }
}

async function ejecutarRestrictSlash(interaction) {
    try {
        // =========================================
        // PERMISOS
        // =========================================

        if (!interaction.guild || !interaction.member) {
            return interaction.reply({
                content:
                    "❌ Este comando solamente puede utilizarse dentro de un servidor.",
                ephemeral: true
            });
        }

        if (!interaction.member.roles.cache.has(RESTRICT_ADMIN_ROLE)) {
            return interaction.reply({
                content:
                    "❌ No tienes permiso para utilizar este comando.",
                ephemeral: true
            });
        }

        // =========================================
        // DATOS
        // =========================================

        const targetUser = interaction.options.getUser("user");

        const time = interaction.options
            .getString("time")
            .toLowerCase();

        const reason = interaction.options
            .getString("reason")
            .trim();

        const appealOption =
            interaction.options.getBoolean("appeal");

        let appeal = null;

        if (appealOption !== null) {
            appeal = appealOption;
        }

        // =========================================
        // PERMANENTE
        // =========================================

        const permanentValues = [
            "permanently",
            "permanente",
            "permanent"
        ];

        const isPermanent = permanentValues.includes(time);

        // =========================================
        // APPEAL
        // =========================================

        if (!isPermanent && appeal !== null) {
            return interaction.reply({
                content:
                    "❌ **Esta función no está disponible al no ser permanente.**\n" +
                    "La opción `appeal` solamente puede utilizarse en restricciones permanentes.",
                ephemeral: true
            });
        }

        // =========================================
        // DURACIÓN
        // =========================================

        let duration = null;

        if (!isPermanent) {
            duration = restrictManager.parseDuration(time);

            if (!duration) {
                return interaction.reply({
                    content:
                        "❌ Duración inválida.\n\n" +
                        "Formatos permitidos:\n" +
                        "`1d` → 1 día\n" +
                        "`7d` → 7 días\n" +
                        "`1M` → 1 mes\n" +
                        "`6M` → 6 meses\n" +
                        "`1y` → 1 año\n" +
                        "`permanently` → permanente",
                    ephemeral: true
                });
            }
        }

        // =========================================
        // CREAR RESTRICCIÓN
        // =========================================

        await restrictManager.createRestriction({
            userId: targetUser.id,
            type: isPermanent ? "permanent" : "temporary",
            duration,
            reason,
            appeal,
            restrictedBy: interaction.user.id
        });

        // =========================================
        // RESPUESTA
        // =========================================

        const durationText = isPermanent
            ? "Permanente"
            : time;

        const appealText = isPermanent
            ? (appeal === true ? "Sí" : "No")
            : "No disponible";

        return interaction.reply({
            content:
                "🔒 **Restricción aplicada correctamente.**\n\n" +
                `**Usuario:** ${targetUser.tag}\n` +
                `**ID:** \`${targetUser.id}\`\n` +
                `**Duración:** ${durationText}\n` +
                `**Motivo:** ${reason}\n` +
                `**Apelación:** ${appealText}`,
            ephemeral: true
        });

    } catch (error) {
        console.error("❌ Error en /restrict:", error);

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({
                content:
                    "❌ Ocurrió un error al intentar aplicar la restricción.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Ocurrió un error al intentar aplicar la restricción.",
            ephemeral: true
        });
    }
}

module.exports = {
    nombre: "restrict",
    name: "restrict",

    data: new SlashCommandBuilder()
        .setName("restrict")
        .setDescription(
            "Restringe globalmente a un usuario del uso de KetchuruBot."
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Usuario que será restringido.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("time")
                .setDescription(
                    "Duración: 1d, 7d, 1M, 1y, permanently..."
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Motivo de la restricción.")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("appeal")
                .setDescription(
                    "¿Puede apelar? Solo disponible para restricciones permanentes."
                )
                .setRequired(false)
        ),

    // Comando !
    ejecutar: ejecutarRestrict,

    // Compatibilidad con el cargador actual
    execute: ejecutarRestrictSlash
};