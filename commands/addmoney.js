const db = require("../../database");

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


        const tienePermiso = message.member.roles.cache.some(
            rol => ROLES_PERMITIDOS.includes(rol.id)
        );


        if (!tienePermiso) {
            return message.reply(
                "❌ No tienes permiso para usar este comando."
            );
        }


        const usuario = message.mentions.users.first();

        const cantidad = Number(args[1]);


        if (!usuario || !cantidad || cantidad <= 0) {
            return message.reply(
                "❌ Uso correcto: `!addmoney @usuario cantidad`"
            );
        }


        if (usuario.id === message.author.id) {
            return message.reply(
                "❌ No puedes darte dinero a ti mismo."
            );
        }


        const miembroObjetivo =
            await message.guild.members.fetch(usuario.id);


        const objetivoTieneRol =
            miembroObjetivo.roles.cache.some(
                rol => ROLES_PERMITIDOS.includes(rol.id)
            );


        if (objetivoTieneRol) {
            return message.reply(
                "❌ No puedes darle dinero a usuarios con roles administrativos."
            );
        }



        let result = await db.query(
            "SELECT balance FROM users WHERE discord_id = $1",
            [usuario.id]
        );


        if (result.rows.length === 0) {

            await db.query(
                "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                [usuario.id, 50]
            );


            result = await db.query(
                "SELECT balance FROM users WHERE discord_id = $1",
                [usuario.id]
            );
        }



        let balance = Number(result.rows[0].balance);



        balance += cantidad;



        await db.query(
            "UPDATE users SET balance = $1 WHERE discord_id = $2",
            [balance, usuario.id]
        );



        message.reply(
            `✅ Se añadieron **${cantidad} 💰 monedas** a ${usuario}.`
        );

    }

};