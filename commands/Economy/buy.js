const { addItem } = require("../../systems/inventory");
const { getShop } = require("../../systems/shop");
const { avanzarMision } = require("../../systems/missionProgress");
const db = require("../../database");


module.exports = {

    name: "buy",


    async execute(message, args) {


        const userId = message.author.id;


        if (!args[0]) {

            return message.reply(
                "❌ Debes especificar un item. Ej: !buy 🍎"
            );

        }



        const emoji = args[0];



        // =========================
        // 🛒 OBTENER TIENDA ACTUAL
        // =========================

        const currentShop = getShop();



        const item = currentShop.find(
            i => i.emoji === emoji
        );



        if (!item) {

            return message.reply(
                "❌ Este item no está actualmente en la tienda."
            );

        }




        // =========================
        // ❌ COMPROBAR STOCK
        // =========================

        if (item.stock <= 0) {

            return message.reply(
                `❌ ${emoji} no tiene stock actualmente.\n🛒 Espera al próximo restock.`
            );

        }




        // =========================
        // 💰 OBTENER BALANCE NEON
        // =========================

        let result = await db.query(
            `
            SELECT balance
            FROM users
            WHERE discord_id=$1
            `,
            [
                userId
            ]
        );



        if (result.rows.length === 0) {


            await db.query(
                `
                INSERT INTO users
                (
                    discord_id,
                    balance
                )

                VALUES
                ($1,$2)
                `,
                [
                    userId,
                    50
                ]
            );



            result = await db.query(
                `
                SELECT balance
                FROM users
                WHERE discord_id=$1
                `,
                [
                    userId
                ]
            );


        }



        let balance =
        Number(result.rows[0].balance);




        // =========================
        // ❌ SIN DINERO
        // =========================

        if (balance < item.price) {

            return message.reply(
                `❌ No tienes suficientes monedas.\nNecesitas: ${item.price}🪙`
            );

        }





        // =========================
        // ✔ COMPRA
        // =========================


        balance -= item.price;



        // quitar stock

        item.stock -= 1;



        // añadir inventario

        addItem(
            userId,
            item.emoji,
            1
        );




        // =========================
        // 🎯 AVANZAR MISIÓN BUY
        // =========================


        const mision = await avanzarMision(
            userId,
            "buy"
        );



        let mensajeMision = "";



        if (mision) {


            mensajeMision =
`
🎉 **MISIÓN COMPLETADA**

🛒 ${mision.nombre}

💰 Recompensa:
+${mision.recompensa} monedas
`;

        }





        // =========================
        // 💾 GUARDAR BALANCE
        // =========================

        await db.query(
            `
            UPDATE users

            SET balance=$1

            WHERE discord_id=$2
            `,
            [
                balance,
                userId
            ]
        );





        // =========================
        // 📩 RESPUESTA
        // =========================

        return message.reply(
`
✅ **Compra realizada**

🎁 Item:
${item.emoji}

💰 Precio:
${item.price}🪙

📦 Stock restante:
${item.stock}

💳 Balance:
${balance}🪙

${mensajeMision}
`
        );


    }

};