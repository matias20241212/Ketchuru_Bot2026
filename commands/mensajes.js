const fs = require("fs");
const path = require("path");

const mensajesPath = path.join(__dirname, "../data/mensajes.json");


function leerMensajes() {
    try {
        return JSON.parse(fs.readFileSync(mensajesPath, "utf8"));
    } catch {
        return {};
    }
}


module.exports = {
    name: "mensajes",

    async execute(message, args) {

        const usuario = message.mentions.users.first() || message.author;

        const mensajes = leerMensajes();

        const cantidad = mensajes[usuario.id]?.total || 0;


        message.reply(
            `💬 **Mensajes de ${usuario.username}:** ${cantidad.toLocaleString()}`
        );
    }
};