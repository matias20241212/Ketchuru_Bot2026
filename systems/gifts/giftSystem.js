const db = require("../../database");


async function crearRegalo(sender, receiver, item, amount) {

    // revisar inventario
    const check = await db.query(
        `
        SELECT amount 
        FROM inventory
        WHERE discord_id = $1
        AND item = $2
        `,
        [sender, item]
    );


    if (check.rows.length === 0) {
        return {
            success:false,
            message:"❌ No tienes ese objeto."
        };
    }


    if (check.rows[0].amount < amount) {
        return {
            success:false,
            message:"❌ No tienes suficiente cantidad."
        };
    }



    // quitar del inventario

    await db.query(
        `
        UPDATE inventory
        SET amount = amount - $1
        WHERE discord_id=$2
        AND item=$3
        `,
        [
            amount,
            sender,
            item
        ]
    );



    // guardar regalo

    await db.query(
        `
        INSERT INTO gifts
        (
        sender_id,
        receiver_id,
        item,
        amount
        )
        VALUES
        ($1,$2,$3,$4)
        `,
        [
            sender,
            receiver,
            item,
            amount
        ]
    );


    return {
        success:true
    };

}



async function obtenerRegalos(user){

    const result = await db.query(
        `
        SELECT *
        FROM gifts
        WHERE receiver_id=$1
        AND status='pending'
        ORDER BY created_at DESC
        `,
        [user]
    );


    return result.rows;

}




async function aceptarRegalo(id,user){

    const regalo = await db.query(
        `
        SELECT *
        FROM gifts
        WHERE id=$1
        AND receiver_id=$2
        `,
        [
            id,
            user
        ]
    );


    if(regalo.rows.length===0)
        return false;



    const data=regalo.rows[0];



    await db.query(
        `
        INSERT INTO inventory
        (
        discord_id,
        item,
        amount
        )
        VALUES
        ($1,$2,$3)

        ON CONFLICT(discord_id,item)
        DO UPDATE SET
        amount = inventory.amount + EXCLUDED.amount
        `,
        [
            user,
            data.item,
            data.amount
        ]
    );



    await db.query(
        `
        UPDATE gifts
        SET status='accepted'
        WHERE id=$1
        `,
        [id]
    );


    return data;

}




async function rechazarRegalo(id,user){


    const regalo = await db.query(
        `
        SELECT *
        FROM gifts
        WHERE id=$1
        AND receiver_id=$2
        `,
        [
            id,
            user
        ]
    );


    if(regalo.rows.length===0)
        return false;



    const data=regalo.rows[0];



    await db.query(
        `
        INSERT INTO inventory
        (
        discord_id,
        item,
        amount
        )
        VALUES
        ($1,$2,$3)

        ON CONFLICT(discord_id,item)
        DO UPDATE SET
        amount = inventory.amount + EXCLUDED.amount
        `,
        [
            data.sender_id,
            data.item,
            data.amount
        ]
    );



    await db.query(
        `
        UPDATE gifts
        SET status='rejected'
        WHERE id=$1
        `,
        [id]
    );


    return data;

}



module.exports={
    crearRegalo,
    obtenerRegalos,
    aceptarRegalo,
    rechazarRegalo
};