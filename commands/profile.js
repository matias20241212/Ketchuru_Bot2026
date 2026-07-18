const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const db = require("../database");

const inventoryPath = path.join(__dirname, "../data/inventory.json");
const messagesPath = path.join(__dirname, "../data/mensajes.json");
const streaksPath = path.join(__dirname, "../data/streaks.json");


function leerJSON(ruta) {
    try {
        return JSON.parse(fs.readFileSync(ruta, "utf8"));
    } catch {
        return {};
    }
}


module.exports = {
    name: "profile",

    async execute(message, args) {

        try {

            const usuario = message.mentions.users.first() || message.author;


            let miembro;

            try {
                miembro = await message.guild.members.fetch(usuario.id);
            } catch {
                miembro = null;
            }


            const inventory = leerJSON(inventoryPath);
            const messages = leerJSON(messagesPath);
            const streaks = leerJSON(streaksPath);



            // 💰 Balance desde Neon
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


            const balance = Number(result.rows[0].balance);



            // 💬 Mensajes
            const totalMensajes = messages[usuario.id]?.total || 0;



            // 🔥 Racha
            const racha = streaks[usuario.id]?.streak || 0;



            // 💎 Mejor objeto
            let mejorObjeto = "Ninguno";


            if (
                inventory[usuario.id] &&
                inventory[usuario.id].length > 0
            ) {

                const ordenRareza = {
                    "Common": 1,
                    "Uncommon": 2,
                    "Rare": 3,
                    "Epic": 4,
                    "Legendary": 5,
                    "Mythic": 6,
                    "Secret Bad": 7,
                    "Secret Medium": 8,
                    "Secret Big": 9
                };


                const objetos = [...inventory[usuario.id]];


                objetos.sort((a, b) =>
                    (ordenRareza[b.rarity] || 0) -
                    (ordenRareza[a.rarity] || 0)
                );


                const objeto = objetos[0];


                mejorObjeto = `${objeto.name} (${objeto.rarity})`;
            }



            // 🏆 Ranking
            let top = "Sin ranking";


            const ranking = await db.query(
                "SELECT discord_id, balance FROM users ORDER BY balance DESC"
            );


            const posicion = ranking.rows.findIndex(
                x => x.discord_id === usuario.id
            );


            if (posicion !== -1) {
                top = `#${posicion + 1}`;
            }



            const fechaServidor = miembro?.joinedTimestamp
                ? `<t:${Math.floor(miembro.joinedTimestamp / 1000)}:d>`
                : "No está en el servidor";


            const fechaDiscord = usuario.createdTimestamp
                ? `<t:${Math.floor(usuario.createdTimestamp / 1000)}:d>`
                : "Desconocido";



            let rol = "Usuario";


            if (miembro) {

                rol =
                    miembro.roles.highest.id === message.guild.id
                    ? "Usuario"
                    : miembro.roles.highest.name;

            }



            const embed = new EmbedBuilder()
                .setColor("#ff8800")
                .setAuthor({
                    name: `Perfil de ${usuario.username}`,
                    iconURL: usuario.displayAvatarURL()
                })
                .setThumbnail(usuario.displayAvatarURL())
                .setImage("https://ketchurubot.onrender.com/images/profile-baner.png")
                .setDescription(
`• 💰 Balance: $${balance.toLocaleString()}
• 🏆 Top dinero: ${top}
• 💬 Mensajes: ${totalMensajes.toLocaleString()}
• 🔥 Racha: ${racha} días
• 💎 Mejor objeto: ${mejorObjeto}
• 🎭 Rol: ${rol}
• 📅 Servidor: ${fechaServidor}
• 🆔 Discord: ${fechaDiscord}`
                )
                .setFooter({
                    text: "KetchuruBot"
                });



            message.reply({
                embeds: [embed]
            });



        } catch (error) {

            console.error("Error en !profile:", error);

            message.reply(
                "❌ Hubo un error al cargar el perfil."
            );
        }
    }
};