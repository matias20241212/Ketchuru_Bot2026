const fs = require("fs");
const path = require("path");


const ROLES_PERMITIDOS = [
    "1465524197085155420", // 👑 Owner
    "1512618062917144708", // 👪 Hermano
    "1495243561883533342", // ♕ Co Owner
    "1516897210862931978", // 🎥 Youtuber grande (+1M)
    "1516896452889153646", // 🎥 Youtuber Mediano
    "1512179364194947343", // 🎥 Youtuber prometedor
    "1497041324631658586", // 🛡️ Staff
    "1465523926431039610", // 🛠️ MOD | Jefatura
    "1522003060426276905", // 🛠️ MOD | Avanzado
    "1522002541355732992"  // 🛠️ MOD | Principiante
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



        const archivo = path.join(
            __dirname,
            "../data/usuarios.json"
        );



        let usuarios;



        try {

            usuarios = JSON.parse(
                fs.readFileSync(archivo, "utf8")
            );


        } catch {

            usuarios = {};

        }




        if (!usuarios[usuario.id]) {

            usuarios[usuario.id] = {

                monedas: 0,

                mensajes: 0,

                inventario: [],

                tragamonedas: {

                    victorias: 0,

                    derrotas: 0

                }

            };

        }




        usuarios[usuario.id].monedas += cantidad;



        fs.writeFileSync(
            archivo,
            JSON.stringify(usuarios, null, 2)
        );



        message.reply(
`✅ Se añadieron **${cantidad} 💰 monedas** a ${usuario}.`
        );


    }

};