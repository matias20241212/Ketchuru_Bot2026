const rankingAPI = require("./Web/api/ranking.js");

const express = require("express");
const db = require("./database");
const app = express();
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.json());

// =========================
// PÁGINA WEB
// =========================

// Servir todos los archivos de la carpeta web
app.use(express.static(path.join(__dirname, "Web")));

// Abrir el dashboard directamente desde "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Web/pages/dashboard.html"));
});

// API Ranking
app.use("/api", rankingAPI);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});

const { Client, GatewayIntentBits } = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// Cargar comandos desde la carpeta comandos/
require("./handlers/comandos")(client);

// =========================
// 🎒 INVENTARIO (PRO)
// =========================
let inventory = {};

const inventoryFile = "./data/inventory.json";

// cargar inventario seguro
if (fs.existsSync(inventoryFile)) {
    try {
        inventory = JSON.parse(fs.readFileSync(inventoryFile));
    } catch (e) {
        inventory = {};
    }
}

function saveInventory() {
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));
}

// =========================
// DEBUG
// =========================
client.on('debug', console.log);
client.on('error', console.error);
client.on('warn', console.warn);

// =========================
// READY
// =========================
client.once("ready", () => {

    console.log(`✅ Conectado como ${client.user.tag}`);

    // =========================
    // 🛒 SHOP SYSTEM (RESTOCK + HAMMER TIME)
    // =========================
    const { restockShop } = require("./systems/shop");
    const cron = require("node-cron");

    setInterval(() => {

        const now = new Date();

        // 🇨🇱 HORA CHILE
        const chileHour = (now.getUTCHours() - 4 + 24) % 24;
        const day = now.getUTCDay();

        let shouldRestock = false;

        // 🟡 LUN - JUE
        if (day >= 1 && day <= 4 && chileHour === 20) {
            shouldRestock = true;
        }

        // 🔵 VIERNES
        if (day === 5 && (chileHour === 8 || chileHour === 20)) {
            shouldRestock = true;
        }

        // 🔴 SÁBADO
        if (day === 6 && (chileHour % 6 === 0 || chileHour === 20)) {
            shouldRestock = true;
        }

        // 🟢 DOMINGO
        if (day === 0 && (chileHour === 8 || chileHour === 20)) {
            shouldRestock = true;
        }

        if (shouldRestock) {
            restockShop();
            console.log("🛒 HAMMER TIME RESTOCK");
        }

    }, 60 * 60 * 1000);


    // =========================
    // 👇 ADMIN ABUSE (TU SISTEMA ORIGINAL)
    // =========================

    function getAdminAbuseTime() {

        return {
            saturday: 15,
            tuesday: 20
        };

    }


    cron.schedule('0 * * * *', async () => {

        const channel = client.channels.cache.get("1512250127518011613");
        if (!channel) return;

        const { saturday, tuesday } = getAdminAbuseTime();

        const now = new Date();
        const day = now.getUTCDay();
        const hour = now.getUTCHours();

        if (day === 6 && hour === (saturday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (sábado) - ${saturday}:00 UTC`);
        }

        if (day === 2 && hour === (tuesday - 12)) {
            channel.send(`⏰ 12 HORAS PARA ADMIN ABUSE (martes) - ${tuesday}:00 UTC`);
        }

        if (day === 6 && hour === saturday) {
            channel.send(`🔥 ADMIN ABUSE INICIADO (sábado) ${saturday}:00 UTC (Hammer time)`);
        }

        if (day === 2 && hour === tuesday) {
            channel.send(`🔥 ADMIN ABUSE INICIADO (martes) ${tuesday}:00 UTC (Hammer time)`);
        }

    });
});

    // =========================
    // MENSAJES + COMANDOS + ECONOMÍA
    // =========================
    const mensajes = new Map();
    const statsServidor = new Map();

    client.on('messageCreate', async (message) => {
        if(message.author.bot) return;
        const { avanzarMision } = require("./systems/missionProgress");


const misionMensaje =
await avanzarMision(
    message.author.id,
    "messages"
);



if(misionMensaje){


message.reply(
`
🎉 **MISIÓN COMPLETADA**

💬 ${misionMensaje.nombre}

💰 Recompensa:
+${misionMensaje.recompensa} monedas
`
);


}

await db.query(
`
UPDATE daily_stats

SET active_today=true

WHERE discord_id=$1
`,
[
message.author.id
]
);

        if (message.author.bot) return;
        if (!message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // =========================
        // 💰 DAR 50 MONEDAS SOLO 1 VEZ
        // =========================
        let result = await db.query(
            "SELECT balance FROM users WHERE discord_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            await db.query(
                "INSERT INTO users (discord_id, balance) VALUES ($1, $2)",
                [userId, 50]
            );
        }

        // =========================
        // 🔥 SISTEMA DE COMANDOS (!)
        // =========================
 if (message.content.startsWith("!")) {

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (command) {
        console.log("DB EN INDEX:", db);
        return (command.ejecutar || command.execute)(message, args, db);
    }

}
        // =========================
        // TU SISTEMA ACTUAL
        // =========================

        if (!mensajes.has(guildId)) {
            mensajes.set(guildId, new Map());
        }

        if (!statsServidor.has(guildId)) {
            statsServidor.set(guildId, {
                total: 0,
                firstMessageTime: Date.now()
            });
        }

        const guildData = mensajes.get(guildId);
        const serverStats = statsServidor.get(guildId);

        if (!guildData.has(userId)) {
            guildData.set(userId, 0);
        }

        guildData.set(userId, guildData.get(userId) + 1);
        serverStats.total++;

        if (message.content === '!mensajes') {
            const count = guildData.get(userId) || 0;
            return message.reply(`📊 Has enviado **${count} mensajes** en este servidor`);
        }

        if (message.content === '!topmensajes') {

            const sorted = [...guildData.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            let text = `🏆 **TOP MENSAJES DEL SERVIDOR**\n\n`;

            for (let i = 0; i < sorted.length; i++) {
                const [userId, count] = sorted[i];
                const user = await client.users.fetch(userId).catch(() => null);

                text += `#${i + 1} - ${user ? user.username : 'Usuario'}: ${count} mensajes\n`;
            }

            return message.reply(text);
        }

        if (message.content === '!stats') {

            const total = serverStats.total;

            const dias = Math.max(
                1,
                Math.floor((Date.now() - serverStats.firstMessageTime) / (1000 * 60 * 60 * 24))
            );

            const promedio = (total / dias).toFixed(2);

            return message.reply(
                `📊 **ESTADÍSTICAS DEL SERVIDOR**\n\n` +
                `💬 Mensajes totales: ${total}\n` +
                `📅 Días activos: ${dias}\n` +
                `📈 Promedio por día: ${promedio}`
            );
        }
    });

    const marketReviews = require("./systems/market/marketReviews");
const giftButtons = require("./systems/gifts/giftButtons");
const giftSystem = require("./systems/gifts/giftSystem");


client.on("interactionCreate", async (interaction) => {


    // =========================
    // 🔘 BOTONES
    // =========================

    if(interaction.isButton()){



        // =========================
        // 🎁 REGALOS
        // =========================


        if(interaction.customId === "gift_accept"){


            const regalos =
            await giftSystem.obtenerRegalos(
                interaction.user.id
            );


            return giftButtons.mostrarSeleccionRegalo(
                interaction,
                regalos,
                "accept"
            );

        }




        if(interaction.customId === "gift_reject"){


            const regalos =
            await giftSystem.obtenerRegalos(
                interaction.user.id
            );


            return giftButtons.mostrarSeleccionRegalo(
                interaction,
                regalos,
                "reject"
            );

        }






        // =========================
        // ⭐ REPUTACIÓN PERSA
        // =========================


        if(
            interaction.customId.startsWith("review_")
        ){


            const estrellas =
            Number(
                interaction.customId.split("_")[1]
            );


            return interaction.reply({

                content:
                `⭐ Elegiste ${estrellas} estrellas.\n\nAhora escribe tu comentario.`,

                ephemeral:true

            });


        }

// =========================
// 🎒 INVENTARIO
// =========================

if(
    interaction.customId.startsWith("inv_item")
){

    const data =
    interaction.customId.split("_");


    const ownerId =
    data[2];


    const page =
    Number(data[3]);


    const index =
    Number(data[4]);


    if(interaction.user.id !== ownerId){

        return interaction.reply({

            content:
            "⚠️ Este inventario no es tuyo.",

            ephemeral:true

        });

    }



    const {
        getInventory
    } = require("./systems/inventory");


    const {
        paginate
    } = require("./systems/inventorySystem");


    const {
        createUseMenu
    } = require("./systems/inventoryUseMenu");



    const items =
    await getInventory(
        interaction.user.id
    );


    const current =
    paginate(
        items,
        page,
        10
    );


    const objeto =
    current[index];


    if(!objeto){

        return interaction.reply({

            content:
            "❌ No existe ese objeto.",

            ephemeral:true

        });

    }



    const {
        setInventoryState
    } = require("./systems/inventoryMenu");



    setInventoryState(

        interaction.user.id,

        {
            ownerId,
            item: objeto.item
        }

    );



    return interaction.reply({

        content:
`
🎒 **Objeto seleccionado**

${objeto.emoji || "📦"} **${objeto.item}**

📦 Cantidad:
${objeto.amount}

¿Cuántos quieres usar?
`,

        components:
        createUseMenu(objeto.item),

        ephemeral:true

    });

}




// =========================
// ⚡ USAR ITEM
// =========================


if(
    interaction.customId.startsWith("use_")
){

    const data =
    interaction.customId.split("_");


    const accion =
    data[1];



    const {
        getInventoryState
    } = require("./systems/inventoryMenu");


    const {
        removeItem
    } = require("./systems/inventory");



    const state =
    getInventoryState(
        interaction.user.id
    );



    if(!state){

        return interaction.reply({

            content:
            "⚠️ Inventario cerrado.",

            ephemeral:true

        });

    }



    if(accion === "cancel"){

        return interaction.update({

            content:
            "❌ Acción cancelada.",

            components:[]

        });

    }



    let cantidad = 1;


    if(accion === "three"){

        cantidad = 3;

    }



    if(accion === "custom"){

        const {
            ModalBuilder,
            TextInputBuilder,
            TextInputStyle,
            ActionRowBuilder
        } = require("discord.js");



        const modal =
        new ModalBuilder()
        .setCustomId(
            "modal_use"
        )
        .setTitle(
            "Cantidad a usar"
        );



        const input =
        new TextInputBuilder()
        .setCustomId("cantidad")
        .setLabel("Cantidad")
        .setStyle(
            TextInputStyle.Short
        );



        modal.addComponents(

            new ActionRowBuilder()
            .addComponents(input)

        );


        return interaction.showModal(modal);

    }



    await removeItem(

        interaction.user.id,

        state.item,

        cantidad

    );



    return interaction.reply({

        content:
        `✔ Usaste **${cantidad}x ${state.item}**`,

        ephemeral:true

    });


}

    // =========================
    // 🧾 MODAL SUBMIT
    // =========================

    } // CIERRE DEL BLOQUE DE BOTONES
    if(interaction.isModalSubmit()){


        if(
            !interaction.customId.startsWith("modal_use_")
        )
        return;



        const {
            getInventoryState
        } = require("./systems/inventoryMenu");


        const {
            removeItem
        } = require("./systems/inventory");



        const cantidad =
        parseInt(
            interaction.fields.getTextInputValue("cantidad")
        );



        if(
            isNaN(cantidad) ||
            cantidad <=0
        ){

            return interaction.reply({

                content:"❌ Cantidad inválida",

                ephemeral:true

            });

        }



        const state =
        getInventoryState(
            interaction.user.id
        );



        if(!state){

            return interaction.reply({

                content:"⚠️ Inventario cerrado.",

                ephemeral:true

            });

        }



        removeItem(
            interaction.user.id,
            state.item,
            cantidad
        );



        return interaction.reply({

            content:
            `✔ Usaste **${cantidad}x ${state.item}**`,

            ephemeral:true

        });


    }

});

    // =========================
    // LOGIN
    // =========================
    client.login(process.env.TOKEN);