const fs = require("fs");
const path = require("path");

const mensajesPath = path.join(__dirname, "../data/mensajes.json");


module.exports = (client) => {

    client.on("messageCreate", (message) => {

        // Ignorar bots
        if (message.author.bot) return;


        let mensajes = {};

        try {
            mensajes = JSON.parse(
                fs.readFileSync(mensajesPath, "utf8")
            );
        } catch {
            mensajes = {};
        }


        // Crear usuario si no existe
        if (!mensajes[message.author.id]) {
            mensajes[message.author.id] = {
                total: 0
            };
        }


        // Sumar mensaje
        mensajes[message.author.id].total++;


        // Guardar
        fs.writeFileSync(
            mensajesPath,
            JSON.stringify(mensajes, null, 4)
        );

    });

};