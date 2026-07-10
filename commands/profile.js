const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const moneyPath = path.join(__dirname, "../data/balance.json");
const inventoryPath = path.join(__dirname, "../data/inventory.json");
const messagesPath = path.join(__dirname, "../data/mensajes.json");
const streaksPath = path.join(__dirname, "../datos/streaks.json");


module.exports = {
    name: "profile",

    async execute(message, args) {

        // Usuario mencionado o el propio usuario
        const usuario = message.mentions.users.first() || message.author;
        const miembro = await message.guild.members.fetch(usuario.id);


        // Leer JSON
        const money = JSON.parse(fs.readFileSync(moneyPath));
        const inventory = JSON.parse(fs.readFileSync(inventoryPath));
        const messages = JSON.parse(fs.readFileSync(messagesPath));
        const streaks = JSON.parse(fs.readFileSync(streaksPath));


        // 💰 Balance
        const balance = money[usuario.id]?.balance || 0;


        // 💬 Mensajes
        const totalMensajes = messages[usuario.id]?.total || 0;


        // 🔥 Racha
        const racha = streaks[usuario.id]?.streak || 0;


        // 💎 Mejor objeto
        let mejorObjeto = "Ninguno";

        if (inventory[usuario.id] && inventory[usuario.id].length > 0) {

            const objetos = inventory[usuario.id];

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

            objetos.sort((a, b) =>
                (ordenRareza[b.rarity] || 0) -
                (ordenRareza[a.rarity] || 0)
            );

            const objeto = objetos[0];

            mejorObjeto = `${objeto.name} (${objeto.rarity})`;
        }


        // 🏆 Top dinero
        let top = "Sin ranking";

        const ranking = Object.entries(money)
            .sort((a, b) =>
                (b[1].balance || 0) - (a[1].balance || 0)
            );

        const posicion = ranking.findIndex(
            usuarioMoney => usuarioMoney[0] === usuario.id
        );

        if (posicion !== -1) {
            top = `#${posicion + 1}`;
        }


        // Fechas
        const fechaServidor = miembro.joinedTimestamp
            ? `<t:${Math.floor(miembro.joinedTimestamp / 1000)}:d>`
            : "Desconocido";


        const fechaDiscord = usuario.createdTimestamp
            ? `<t:${Math.floor(usuario.createdTimestamp / 1000)}:d>`
            : "Desconocido";


        // Rol
        const rol =
            miembro.roles.highest.id === message.guild.id
            ? "Usuario"
            : miembro.roles.highest.name;


        // Embed
        const embed = new EmbedBuilder()
            .setColor("#ff8800")
            .setAuthor({
                name: `Perfil de ${usuario.username}`,
                iconURL: usuario.displayAvatarURL()
            })
            .setThumbnail(usuario.displayAvatarURL())
            .setDescription(
`• 💰 Balance: $${balance.toLocaleString()}
• 🏆 Top: ${top}
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

    }
};