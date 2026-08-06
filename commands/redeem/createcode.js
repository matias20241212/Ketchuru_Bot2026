const redeemSystem = require("../../systems/redeem/redeemSystem");

module.exports = {
    nombre: "createcode",

    async ejecutar(message, args, db) {

        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ No tienes permisos.");
        }


        const codigo = args[0];
        const duracion = args[1];


        if (!codigo || !duracion) {
            return message.reply(
                "❌ Uso correcto:\n" +
                "`!createcode CODIGO DURACION`\n\n" +
                "Ejemplos:\n" +
                "`!createcode KETCHURU siempre`\n" +
                "`!createcode FERIA2027 7d`\n" +
                "`!createcode EVENTO 24h`"
            );
        }


        const resultado = await redeemSystem.crearCodigo(
            db,
            codigo.toUpperCase(),
            duracion,
            message.author.id
        );


        message.reply(
`
✅ **Código creado**

🎟️ Código:
\`${resultado.codigo}\`

🪙 Recompensa:
${resultado.recompensa.toLocaleString()} monedas

⏳ Duración:
${duracion === "siempre" ? "♾️ Permanente" : duracion}

📦 Usos:
0
`
        );

    }
};