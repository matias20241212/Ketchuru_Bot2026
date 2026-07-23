const db = require("../database");



// =========================
// ➕ AÑADIR OBJETO
// =========================

async function addItem(
    userId,
    item,
    amount = 1,
    emoji = null,
    rarity = null,
    effect = null
){


    const result = await db.query(
        `
        SELECT amount

        FROM inventory

        WHERE discord_id = $1

        AND item = $2
        `,
        [
            userId,
            item
        ]
    );




    // 🆕 OBJETO NUEVO

    if(result.rows.length === 0){


        await db.query(
            `
            INSERT INTO inventory
            (
                discord_id,
                item,
                amount,
                emoji,
                rarity,
                effect
            )

            VALUES
            ($1,$2,$3,$4,$5,$6)
            `,
            [
                userId,
                item,
                amount,
                emoji,
                rarity,
                effect
            ]
        );



    }



    // 📦 OBJETO EXISTENTE

    else{


        await db.query(
            `
            UPDATE inventory

            SET

            amount = amount + $1,

            emoji = $4,

            rarity = $5,

            effect = $6


            WHERE discord_id = $2

            AND item = $3

            `,
            [
                amount,
                userId,
                item,
                emoji,
                rarity,
                effect
            ]
        );


    }


}






// =========================
// ➖ QUITAR OBJETO
// =========================

async function removeItem(
    userId,
    item,
    amount = 1
){


    const result =
    await db.query(
        `
        SELECT amount

        FROM inventory

        WHERE discord_id=$1

        AND item=$2
        `,
        [
            userId,
            item
        ]
    );



    if(result.rows.length === 0){

        return false;

    }




    const total =
    result.rows[0].amount - amount;




    if(total <= 0){


        await db.query(
            `
            DELETE FROM inventory

            WHERE discord_id=$1

            AND item=$2
            `,
            [
                userId,
                item
            ]
        );



    }


    else{


        await db.query(
            `
            UPDATE inventory

            SET amount=$1


            WHERE discord_id=$2

            AND item=$3
            `,
            [
                total,
                userId,
                item
            ]
        );


    }



    return true;

}








// =========================
// 📦 OBTENER INVENTARIO
// =========================

async function getInventory(userId){


    const result =
    await db.query(
        `
        SELECT

        item,
        amount,
        emoji,
        rarity,
        effect


        FROM inventory


        WHERE discord_id=$1

        `,
        [
            userId
        ]
    );



    return result.rows;


}








module.exports = {

    addItem,

    removeItem,

    getInventory

};