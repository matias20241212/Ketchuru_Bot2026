const redeemSystem = require("../../systems/redeem/redeemSystem");

module.exports = {
    nombre: "createcode",

    async ejecutar(message, args, db) {

        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ No tienes permisos.");
        }


        const codigo = args[0];
        const duracion = args[1];
        const recompensa = Number(args[2]);


        if (!codigo || !duracion || !recompensa) {
            return message.reply(
                "❌ Uso:\n" +
                "`!createcode CODIGO DURACION RECOMPENSA`\n\n" +
                "Ejemplos:\n" +
                "`!createcode KETCHURU siempre 500000`\n" +
                "`!createcode FERIA2027 7d 1000000`"
            );
        }


        const resultado = await redeemSystem.crearCodigo(
            db,
            codigo.toUpperCase(),
            duracion,
            recompensa,
            message.author.id
        );


        message.reply(
`
✅ **Código creado**

🎟️ Código:
\`${resultado.codigo}\`

⏳ Duración:
${duracion === "siempre" ? "♾️ Permanente" : duracion}

🪙 Recompensa:
${resultado.recompensa.toLocaleString()} monedas

📦 Usos:
0
`
        );

    }
};  