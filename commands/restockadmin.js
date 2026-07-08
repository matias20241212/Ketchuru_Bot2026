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

    nombre: "restock",

    async ejecutar(message) {


        const tienePermiso = message.member.roles.cache.some(
            rol => ROLES_PERMITIDOS.includes(rol.id)
        );


        if (!tienePermiso) {
            return message.reply(
                "❌ No tienes permiso para usar este comando."
            );
        }


        const archivo = path.join(
            __dirname,
            "../datos/restock.json"
        );


        let datos;


        try {

            datos = JSON.parse(
                fs.readFileSync(archivo, "utf8")
            );

        } catch {

            datos = {
                ultimoRestock: "",
                proximoRestock: "",
                items: [],
                probabilidades: {}
            };

        }



        // Aquí después conectaremos el generador de objetos
        // de las 20 casillas de la tienda

        datos.items = [];



        const ahora = new Date();


        const siguiente = new Date();

        siguiente.setDate(
            siguiente.getDate() + 1
        );

        siguiente.setHours(
            20,
            0,
            0,
            0
        );


        datos.ultimoRestock = ahora.toISOString();

        datos.proximoRestock = siguiente.toISOString();



        fs.writeFileSync(
            archivo,
            JSON.stringify(datos, null, 2)
        );



        message.reply(
`✅ **Restock realizado**

🛒 La tienda fue actualizada.

⏰ Próximo restock:
${siguiente.toLocaleString("es-CL")}`
        );


    }

};