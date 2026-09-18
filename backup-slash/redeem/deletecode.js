module.exports = {
    nombre: "deletecode",

    async ejecutar(message, args, db) {

        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Sin permisos.");
        }


        const codigo = args[0];


        if (!codigo) {
            return message.reply(
                "❌ Usa: `!deletecode CODIGO`"
            );
        }


        const resultado = await db.query(
            `
            DELETE FROM redeem_codes
WHERE code=$1
            RETURNING code
            `,
            [codigo.toUpperCase()]
        );


        if (resultado.rowCount === 0) {
            return message.reply(
                "❌ Ese código no existe."
            );
        }


        message.reply(
`
🗑️ **Código eliminado**

🎟️ Código:
\`${resultado.rows[0].code}\`

✅ Eliminado correctamente.
`
        );

    }
};