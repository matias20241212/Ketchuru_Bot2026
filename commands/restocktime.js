const fs = require("fs");
const path = require("path");

module.exports = {
    nombre: "restocktime",

    async ejecutar(message) {

        const archivo = path.join(__dirname, "../datos/restocktime.json");

        const datos = JSON.parse(fs.readFileSync(archivo, "utf8"));

        const ahora = new Date();
        const proximo = new Date(datos.proximoRestock);

        let diferencia = proximo - ahora;

        if (diferencia <= 0) {
            return message.reply("🛒 El restock está ocurriendo o ya debería haberse realizado.");
        }

        const horas = Math.floor(diferencia / 3600000);
        diferencia %= 3600000;

        const minutos = Math.floor(diferencia / 60000);
        diferencia %= 60000;

        const segundos = Math.floor(diferencia / 1000);


        message.reply(
`🛒 **Próximo Restock**

⏰ Faltan:
**${horas}h ${minutos}m ${segundos}s**

📅 Próximo:
${proximo.toLocaleString("es-CL")}

🇨🇱 Hora de Chile`
        );
    }
};