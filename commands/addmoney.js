const db = require("../database");

const ROLES_PERMITIDOS = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1516897210862931978",
    "1516896452889153646",
    "1512179364194947343",
    "1497041324631658586",
    "1465523926431039610",
    "1522003060426276905",
    "1522002541355732992"
];

module.exports = {

    nombre: "addmoney",

    async ejecutar(message, args) {

        // Comprobar permisos del administrador
        const tienePermiso = message.member.roles.cache.some(
            rol => ROLES_PERMITIDOS.includes(rol.id)
        );

        if (!tienePermiso) {
            return message.reply(
                "❌ No tienes permiso para usar este comando."
            );
        }

        // Uso:
        // !addmoney @Usuario cantidad
        // !addmoney ID cantidad
        if (args.length < 2) {
            return message.reply(
                "❌ Uso correcto:\n" +
                "`!addmoney @usuario cantidad`\n" +
                "`!addmoney ID cantidad`"
            );
        }

        const usuarioInput = args[0];
        const cantidadInput = args[1].replace(/,/g, "");

        // Comprobar cantidad
        if (!/^\d+$/.test(cantidadInput)) {
            return message.reply(
                "❌ La cantidad debe ser un número válido."
            );
        }

        const cantidad = Number(cantidadInput);

        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            return message.reply(
                "❌ La cantidad debe ser mayor que 0."
            );
        }

        let userId;

        // Detectar @Usuario
        const mentionMatch = usuarioInput.match(/^<@!?(\d+)>$/);

        if (mentionMatch) {
            userId = mentionMatch[1];
        }

        // Detectar ID de Discord
        else if (/^\d{17,20}$/.test(usuarioInput)) {
            userId = usuarioInput;
        }

        else {
            return message.reply(
                "❌ Debes mencionar al usuario o colocar un ID de Discord válido.\n\n" +
                "Ejemplos:\n" +
                "`!addmoney @Usuario 5000`\n" +
                "`!addmoney 123456789012345678 5000`"
            );
        }

        // No permitir darse dinero a sí mismo
        if (userId === message.author.id) {
            return message.reply(
                "❌ No puedes darte dinero a ti mismo."
            );
        }

        try {

            // Intentar encontrar al usuario en el servidor
            let miembroObjetivo = null;

            try {
                miembroObjetivo =
                    await message.guild.members.fetch(userId);
            } catch {
                // Si no está en el servidor, continuamos usando el ID.
            }

            // Si está en el servidor, comprobar sus roles
            if (miembroObjetivo) {

                const objetivoTieneRol =
                    miembroObjetivo.roles.cache.some(
                        rol => ROLES_PERMITIDOS.includes(rol.id)
                    );

                if (objetivoTieneRol) {
                    return message.reply(
                        "❌ No puedes darle dinero a usuarios con roles administrativos."
                    );
                }
            }

            // Buscar usuario en la economía
            let result = await db.query(
                "SELECT balance FROM users WHERE discord_id = $1",
                [userId]
            );

            // Si no existe, crear cuenta con 50 monedas
            if (result.rows.length === 0) {

                await db.query(
                    "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                    [userId, 50]
                );

                result = await db.query(
                    "SELECT balance FROM users WHERE discord_id = $1",
                    [userId]
                );
            }

            // Balance actual
            let balance = Number(result.rows[0].balance);

            // Añadir monedas
            balance += cantidad;

            // Guardar nuevo balance
            await db.query(
                "UPDATE users SET balance = $1 WHERE discord_id = $2",
                [balance, userId]
            );

            // Confirmación
            return message.reply(
                `✅ Se añadieron **${cantidad.toLocaleString("es-CL")} 💰 monedas** a <@${userId}>.\n` +
                `💰 Nuevo balance: **${balance.toLocaleString("es-CL")}** monedas.`
            );

        } catch (error) {

            console.error("Error en !addmoney:", error);

            return message.reply(
                "❌ Ocurrió un error al añadir las monedas."
            );
        }
    }
};