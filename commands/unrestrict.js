const { SlashCommandBuilder } = require("discord.js");

const restrictManager = require("../systems/restrict/restrictManager");

const RESTRICT_ADMIN_ROLE = "1465524197085155420";

// =====================================================
// !UNRESTRICT
// =====================================================

async function ejecutarUnrestrict(message, args) {
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

        if (!args || args.length < 1) {
            return message.reply(
                "❌ Uso correcto:\n\n" +
                "`!unrestrict USER/ID`\n" +
                "`!unrestrict global`\n" +
                "`!unrestrict global -N USER_ID USER_ID ...`\n\n" +
                "Ejemplos:\n" +
                "`!unrestrict 123456789012345678`\n" +
                "`!unrestrict @Usuario`\n" +
                "`!unrestrict global`\n" +
                "`!unrestrict global -2 123456789012345678 987654321098765432`"
            );
        }

        const targetInput = args[0];

        // =========================================
        // UNRESTRICT GLOBAL
        // =========================================

        if (targetInput.toLowerCase() === "global") {
            let exceptUserIds = [];

            // !unrestrict global
            if (args.length === 1) {
                exceptUserIds = [];
            }

            // !unrestrict global -N ID ID...
            else {
                const amountArgument = args[1];

                if (!amountArgument.startsWith("-")) {
                    return message.reply(
                        "❌ Formato incorrecto.\n\n" +
                        "Usa:\n" +
                        "`!unrestrict global -N USER_ID USER_ID ...`"
                    );
                }

                const amount = Number(amountArgument.slice(1));

                if (!Number.isInteger(amount) || amount < 1) {
                    return message.reply(
                        "❌ `-N` debe indicar un número válido de excepciones.\n\n" +
                        "Ejemplo: `-2`"
                    );
                }

                exceptUserIds = args.slice(2);

                if (exceptUserIds.length !== amount) {
                    return message.reply(
                        `❌ Indicastes \`${amount}\` excepciones, ` +
                        `pero proporcionaste \`${exceptUserIds.length}\` IDs.`
                    );
                }

                const invalidIds = exceptUserIds.filter(
                    id => !/^\d{17,20}$/.test(id)
                );

                if (invalidIds.length > 0) {
                    return message.reply(
                        "❌ Los siguientes IDs no son válidos:\n" +
                        invalidIds.map(id => `\`${id}\``).join(", ")
                    );
                }
            }

            // =========================================
            // EJECUTAR DESRESTRICCIÓN GLOBAL
            // =========================================

            await restrictManager.unrestrictGlobal(exceptUserIds);

            // =========================================
            // RESPUESTA
            // =========================================

            if (exceptUserIds.length === 0) {
                return message.reply(
                    "🔓 **Desrestricción global completada.**\n\n" +
                    "Se eliminaron todas las restricciones **temporales y permanentes**."
                );
            }

            return message.reply(
                "🔓 **Desrestricción global completada.**\n\n" +
                "Se eliminaron todas las restricciones **temporales y permanentes**, " +
                `excepto las de **${exceptUserIds.length} usuario(s)**.\n\n` +
                exceptUserIds.map(id => `• \`${id}\``).join("\n")
            );
        }

        // =========================================
        // UNRESTRICT INDIVIDUAL
        // =========================================

        let userId = targetInput.replace(/[<@!>]/g, "");

        let targetUser;

        try {
            targetUser = await message.client.users.fetch(userId);
        } catch {
            return message.reply(
                "❌ No pude encontrar ese usuario o ID de Discord."
            );
        }

        userId = targetUser.id;

        // =========================================
        // EJECUTAR
        // =========================================

        const result = await restrictManager.unrestrictUser(userId);

        if (result === false) {
            return message.reply(
                `ℹ️ **${targetUser.tag}** no tiene ninguna restricción activa.`
            );
        }

        return message.reply(
            "🔓 **Restricción eliminada correctamente.**\n\n" +
            `**Usuario:** ${targetUser.tag}\n` +
            `**ID:** \`${userId}\`\n` +
            "**Estado:** Sin restricción activa"
        );

    } catch (error) {
        console.error("❌ Error en !unrestrict:", error);

        return message.reply(
            "❌ Ocurrió un error al intentar eliminar la restricción."
        );
    }
}

// =====================================================
// /UNRESTRICT
// =====================================================

async function ejecutarUnrestrictSlash(interaction) {
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
        const global = interaction.options.getBoolean("global");
        const exceptions = interaction.options.getString("exceptions");

        // =========================================
        // UNRESTRICT GLOBAL
        // =========================================

        if (global === true) {
            let exceptUserIds = [];

            if (exceptions) {
                const parts = exceptions.trim().split(/\s+/);
                const amountArgument = parts[0];

                if (!amountArgument.startsWith("-")) {
                    return interaction.reply({
                        content:
                            "❌ Formato incorrecto.\n\n" +
                            "Usa:\n" +
                            "`-N USER_ID USER_ID ...`",
                        ephemeral: true
                    });
                }

                const amount = Number(amountArgument.slice(1));

                if (!Number.isInteger(amount) || amount < 1) {
                    return interaction.reply({
                        content:
                            "❌ `-N` debe indicar un número válido de excepciones.",
                        ephemeral: true
                    });
                }

                exceptUserIds = parts.slice(1);

                if (exceptUserIds.length !== amount) {
                    return interaction.reply({
                        content:
                            `❌ Indicastes \`${amount}\` excepciones, ` +
                            `pero proporcionaste \`${exceptUserIds.length}\` IDs.`,
                        ephemeral: true
                    });
                }

                const invalidIds = exceptUserIds.filter(
                    id => !/^\d{17,20}$/.test(id)
                );

                if (invalidIds.length > 0) {
                    return interaction.reply({
                        content:
                            "❌ Hay IDs de Discord inválidos:\n" +
                            invalidIds.map(id => `\`${id}\``).join(", "),
                        ephemeral: true
                    });
                }
            }

            // =========================================
            // EJECUTAR
            // =========================================

            await restrictManager.unrestrictGlobal(exceptUserIds);

            if (exceptUserIds.length === 0) {
                return interaction.reply({
                    content:
                        "🔓 **Desrestricción global completada.**\n\n" +
                        "Se eliminaron todas las restricciones **temporales y permanentes**.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "🔓 **Desrestricción global completada.**\n\n" +
                    "Se eliminaron todas las restricciones **temporales y permanentes**, " +
                    `excepto las de **${exceptUserIds.length} usuario(s)**.\n\n` +
                    exceptUserIds.map(id => `• \`${id}\``).join("\n"),
                ephemeral: true
            });
        }

        // =========================================
        // UNRESTRICT INDIVIDUAL
        // =========================================

        if (!targetUser) {
            return interaction.reply({
                content:
                    "❌ Debes seleccionar un usuario.",
                ephemeral: true
            });
        }

        const result = await restrictManager.unrestrictUser(
            targetUser.id
        );

        if (result === false) {
            return interaction.reply({
                content:
                    `ℹ️ **${targetUser.tag}** no tiene ninguna restricción activa.`,
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "🔓 **Restricción eliminada correctamente.**\n\n" +
                `**Usuario:** ${targetUser.tag}\n` +
                `**ID:** \`${targetUser.id}\`\n` +
                "**Estado:** Sin restricción activa",
            ephemeral: true
        });

    } catch (error) {
        console.error("❌ Error en /unrestrict:", error);

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({
                content:
                    "❌ Ocurrió un error al intentar eliminar la restricción.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Ocurrió un error al intentar eliminar la restricción.",
            ephemeral: true
        });
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    nombre: "unrestrict",
    name: "unrestrict",

    data: new SlashCommandBuilder()
        .setName("unrestrict")
        .setDescription(
            "Elimina una restricción global o la de un usuario."
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "Usuario al que se le quitará la restricción."
                )
                .setRequired(false)
        )

        .addBooleanOption(option =>
            option
                .setName("global")
                .setDescription(
                    "Eliminar todas las restricciones."
                )
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("exceptions")
                .setDescription(
                    "Excepciones: -N USER_ID USER_ID..."
                )
                .setRequired(false)
        ),

    // Comando !
    ejecutar: ejecutarUnrestrict,

    // Comando slash /
    execute: ejecutarUnrestrictSlash
};