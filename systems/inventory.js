const db = require("../database");


// Añadir objeto
async function addItem(userId, item, amount = 1) {

    const result = await db.query(
        `
        SELECT amount 
        FROM inventory
        WHERE discord_id = $1
        AND item = $2
        `,
        [userId, item]
    );


    if (result.rows.length === 0) {

        await db.query(
            `
            INSERT INTO inventory
            (discord_id, item, amount)
            VALUES ($1,$2,$3)
            `,
            [
                userId,
                item,
                amount
            ]
        );

    } else {

        await db.query(
            `
            UPDATE inventory
            SET amount = amount + $1
            WHERE discord_id = $2
            AND item = $3
            `,
            [
                amount,
                userId,
                item
            ]
        );
    }
}



// Quitar objeto
async function removeItem(userId, item, amount = 1) {


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


    if (result.rows.length === 0) {
        return false;
    }


    let total = result.rows[0].amount - amount;


    if (total <= 0) {

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

    } else {

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



// Obtener inventario
async function getInventory(userId) {

    const result = await db.query(
        `
        SELECT item, amount
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