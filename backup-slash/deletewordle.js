const db = require("../database");

const ROLES_PERMITIDOS = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1516897210862931978",
    "1516896452889153646",
    "1512179364194947343",
    "1497041324631658586"
];

const confirmaciones =
    new Map();

// ============================================================
// 🛡️ PERMISOS
// ============================================================

function tienePermiso(member) {

    return member.roles.cache.some(
        role =>
            ROLES_PERMITIDOS.includes(role.id)
    );

}

// ============================================================
// 🗑️ COMANDO
// ============================================================

async function ejecutar(message, args) {

    if (!message.guild) {

        return message.reply(
            "❌ Este comando solo puede utilizarse dentro de un servidor."
        );

    }

    if (
        !tienePermiso(message.member)
    ) {

        return message.reply(
            "❌ No tienes permiso para eliminar Wordles."
        );

    }

    if (
        args.length === 0
    ) {

        return message.reply(
            "❌ Uso correcto:\n`!deletewordle Nombre`"
        );

    }

    const nombre =
        args.join(" ");

    try {

        const result =
            await db.query(
                `
                SELECT *
                FROM wordle_creados
                WHERE LOWER(nombre) = LOWER($1)
                  AND activo = true
                ORDER BY creado_en DESC
                LIMIT 1
                `,
                [nombre]
            );

        if (
            result.rows.length === 0
        ) {

            return message.reply(
                `❌ No existe un Wordle activo llamado **${nombre}**.`
            );

        }

        const wordle =
            result.rows[0];

        confirmaciones.set(
            message.author.id,
            {
                wordleId: wordle.id,
                nombre: wordle.nombre,
                expires:
                    Date.now() +
                    30 * 1000
            }
        );

        return message.reply(
            `⚠️ **CONFIRMAR ELIMINACIÓN**\n\n` +
            `¿Quieres eliminar el Wordle **${wordle.nombre}**?\n\n` +
            `🆔 ID: \`${wordle.id}\`\n\n` +
            `Escribe **CONFIRMAR** para eliminarlo.\n` +
            `⏳ Tienes 30 segundos.`
        );

    } catch (error) {

        console.error(
            "❌ Error buscando Wordle:",
            error
        );

        return message.reply(
            "❌ Ocurrió un error buscando el Wordle."
        );

    }

}

// ============================================================
// ✅ CONFIRMACIÓN
// ============================================================

async function confirmarEliminacion(message) {

    const data =
        confirmaciones.get(
            message.author.id
        );

    if (!data) {
        return false;
    }

    if (
        Date.now() > data.expires
    ) {

        confirmaciones.delete(
            message.author.id
        );

        return false;

    }

    if (
        message.content
            .trim()
            .toLowerCase() !==
        "confirmar"
    ) {

        return false;

    }

    try {

        await db.query(
            `
            UPDATE wordle_creados
            SET activo = false
            WHERE id = $1
            `,
            [data.wordleId]
        );

        confirmaciones.delete(
            message.author.id
        );

        await message.reply(
            `🗑️ **Wordle eliminado correctamente.**\n\n` +
            `📛 Nombre: **${data.nombre}**\n` +
            `🆔 ID: \`${data.wordleId}\``
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Error eliminando Wordle:",
            error
        );

        return false;

    }

}

module.exports = {
    name: "deletewordle",
    ejecutar,
    confirmarEliminacion
};