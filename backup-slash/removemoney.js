const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "remove",

    async ejecutar(message, args, db) {
        // IDs autorizados para usar el comando
        const usuariosAutorizados = [
            "1431695828497469501",
            "1421895172626710569"
        ];

        // Comprobar si quien ejecuta está autorizado
        if (!usuariosAutorizados.includes(message.author.id)) {
            return message.reply("❌ No tienes permiso para usar este comando.");
        }

        // !remove money @Usuario cantidad
        // !remove money ID cantidad
        if (args.length < 3 || args[0].toLowerCase() !== "money") {
            return message.reply(
                "❌ Uso correcto:\n" +
                "`!remove money @Usuario cantidad`\n" +
                "`!remove money ID cantidad`"
            );
        }

        const usuarioInput = args[1];
        const cantidadInput = args[2].replace(/,/g, "");

        // Validar cantidad
        if (!/^\d+$/.test(cantidadInput)) {
            return message.reply("❌ La cantidad debe ser un número válido.");
        }

        const cantidad = BigInt(cantidadInput);

        if (cantidad <= 0n) {
            return message.reply("❌ La cantidad debe ser mayor que 0.");
        }

        // Obtener ID desde mención o ID directamente
        let userId;

        const mentionMatch = usuarioInput.match(/^<@!?(\d+)>$/);

        if (mentionMatch) {
            userId = mentionMatch[1];
        } else if (/^\d{17,20}$/.test(usuarioInput)) {
            userId = usuarioInput;
        } else {
            return message.reply(
                "❌ Debes mencionar al usuario o colocar un ID de Discord válido."
            );
        }

        try {
            // Buscar al usuario en la base de datos
            const result = await db.query(
                `SELECT discord_id, balance
                 FROM users
                 WHERE discord_id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                return message.reply(
                    "❌ Ese usuario no tiene una cuenta registrada en la economía."
                );
            }

            const balanceActual = BigInt(result.rows[0].balance);

            // Evitar balance negativo
            const cantidadRemovida =
                cantidad > balanceActual ? balanceActual : cantidad;

            const nuevoBalance = balanceActual - cantidadRemovida;

            // Actualizar balance
            await db.query(
                `UPDATE users
                 SET balance = $1
                 WHERE discord_id = $2`,
                [nuevoBalance.toString(), userId]
            );

            return message.reply(
                `✅ Se quitaron **${cantidadRemovida.toLocaleString("es-CL")}** monedas a <@${userId}>.\n` +
                `💰 Nuevo balance: **${nuevoBalance.toLocaleString("es-CL")}** monedas.`
            );

        } catch (error) {
            console.error("Error en !remove money:", error);

            return message.reply(
                "❌ Ocurrió un error al quitar las monedas."
            );
        }
    }
};