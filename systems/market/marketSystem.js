const db = require("../../database");



// Crear publicación en el Persa
async function crearVenta(
    sellerId,
    item,
    cantidad,
    precio,
    nota = null
){

    // Revisar inventario
    const inventario = await db.query(
        `
        SELECT amount
        FROM inventory
        WHERE discord_id=$1
        AND item=$2
        `,
        [
            sellerId,
            item
        ]
    );



    if(inventario.rows.length === 0){

        return {
            success:false,
            message:"❌ No tienes ese objeto."
        };

    }



    if(inventario.rows[0].amount < cantidad){

        return {
            success:false,
            message:"❌ No tienes esa cantidad."
        };

    }



    // Crear publicación y obtener ID
    const venta = await db.query(
        `
        INSERT INTO market_listings
        (
            seller_id,
            item,
            amount,
            price_each,
            note
        )

        VALUES
        ($1,$2,$3,$4,$5)

        RETURNING id
        `,
        [
            sellerId,
            item,
            cantidad,
            precio,
            nota
        ]
    );



    const listingId =
    venta.rows[0].id;




    // Quitar objetos del inventario

    await db.query(
        `
        UPDATE inventory
        SET amount = amount - $1
        WHERE discord_id=$2
        AND item=$3
        `,
        [
            cantidad,
            sellerId,
            item
        ]
    );





    // Crear bloqueo del objeto

    await db.query(
        `
        INSERT INTO market_locks
        (
            user_id,
            item,
            amount,
            listing_id
        )

        VALUES
        ($1,$2,$3,$4)
        `,
        [
            sellerId,
            item,
            cantidad,
            listingId
        ]
    );





    return {
        success:true
    };

}






// Ver Persa general

async function obtenerVentas(){

    const result = await db.query(
        `
        SELECT *
        FROM market_listings
        ORDER BY price_each DESC
        `
    );


    return result.rows;

}






// Ver Persa de un usuario

async function obtenerVentasUsuario(user){

    const result = await db.query(
        `
        SELECT *
        FROM market_listings
        WHERE seller_id=$1
        ORDER BY price_each DESC
        `,
        [
            user
        ]
    );


    return result.rows;

}







// Retirar venta del Persa

async function retirarVenta(
    user,
    item,
    cantidad
){



    const venta = await db.query(
        `
        SELECT *
        FROM market_listings
        WHERE seller_id=$1
        AND item=$2
        `,
        [
            user,
            item
        ]
    );




    if(venta.rows.length===0){

        return false;

    }




    const data =
    venta.rows[0];





    let retirar =
    cantidad || data.amount;



    if(retirar > data.amount){

        retirar = data.amount;

    }







// Revisar si ya tiene el objeto

const existeInventario = await db.query(
    `
    SELECT amount
    FROM inventory
    WHERE discord_id=$1
    AND item=$2
    `,
    [
        user,
        item
    ]
);



if(existeInventario.rows.length > 0){


    await db.query(
        `
        UPDATE inventory
        SET amount = amount + $1
        WHERE discord_id=$2
        AND item=$3
        `,
        [
            retirar,
            user,
            item
        ]
    );


}else{


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
        `,
        [
            user,
            item,
            retirar
        ]
    );


}







    // Si baja todo

    if(retirar === data.amount){



        await db.query(
            `
            DELETE FROM market_listings
            WHERE id=$1
            `,
            [
                data.id
            ]
        );




        // eliminar bloqueo

        await db.query(
            `
            DELETE FROM market_locks
            WHERE listing_id=$1
            `,
            [
                data.id
            ]
        );



    }

    else{



        // Reducir publicación

        await db.query(
            `
            UPDATE market_listings
            SET amount=amount-$1
            WHERE id=$2
            `,
            [
                retirar,
                data.id
            ]
        );




        // Reducir bloqueo

        await db.query(
            `
            UPDATE market_locks
            SET amount=amount-$1
            WHERE listing_id=$2
            `,
            [
                retirar,
                data.id
            ]
        );


    }






 return true;

}





// Comprar objeto del Persa
async function comprarVenta(
    buyerId,
    sellerId,
    item,
    cantidad = 1
){

    const venta = await db.query(
        `
        SELECT *
        FROM market_listings
        WHERE seller_id=$1
        AND item=$2
        `,
        [
            sellerId,
            item
        ]
    );


    if(venta.rows.length === 0){

        return {
            success:false,
            message:"❌ Esa venta no existe."
        };

    }


    const data = venta.rows[0];


    if(data.amount < cantidad){

        return {
            success:false,
            message:"❌ No hay suficiente cantidad."
        };

    }


    const precioTotal = data.price_each * cantidad;



    const dinero = await db.query(
        `
        SELECT balance
        FROM users
        WHERE discord_id=$1
        `,
        [
            buyerId
        ]
    );


    if(
        dinero.rows.length === 0 ||
        dinero.rows[0].balance < precioTotal
    ){

        return {
            success:false,
            message:"❌ No tienes suficientes monedas."
        };

    }



    await db.query(
        `
        UPDATE users
        SET balance = balance - $1
        WHERE discord_id=$2
        `,
        [
            precioTotal,
            buyerId
        ]
    );



    await db.query(
        `
        UPDATE users
        SET balance = balance + $1
        WHERE discord_id=$2
        `,
        [
            precioTotal,
            sellerId
        ]
    );



    const existe = await db.query(
        `
        SELECT amount
        FROM inventory
        WHERE discord_id=$1
        AND item=$2
        `,
        [
            buyerId,
            item
        ]
    );


    if(existe.rows.length > 0){

        await db.query(
            `
            UPDATE inventory
            SET amount = amount + $1
            WHERE discord_id=$2
            AND item=$3
            `,
            [
                cantidad,
                buyerId,
                item
            ]
        );

    }else{

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
            `,
            [
                buyerId,
                item,
                cantidad
            ]
        );

    }



    if(cantidad === data.amount){

        await db.query(
            `
            DELETE FROM market_listings
            WHERE id=$1
            `,
            [
                data.id
            ]
        );

    }else{

        await db.query(
            `
            UPDATE market_listings
            SET amount = amount - $1
            WHERE id=$2
            `,
            [
                cantidad,
                data.id
            ]
        );

    }



    await db.query(
        `
        INSERT INTO market_sales
        (
            seller_id,
            buyer_id,
            item,
            amount,
            total_price
        )

        VALUES
        ($1,$2,$3,$4,$5)
        `,
        [
            sellerId,
            buyerId,
            item,
            cantidad,
            precioTotal
        ]
    );


    return {
        success:true,
        precio:precioTotal
    };

}








// Estadísticas del vendedor








// Estadísticas del vendedor

async function obtenerEstadisticas(user){



    const ventas = await db.query(
        `
        SELECT COUNT(*)
        FROM market_sales
        WHERE seller_id=$1
        `,
        [
            user
        ]
    );




    const publicaciones = await db.query(
        `
        SELECT COUNT(*)
        FROM market_listings
        WHERE seller_id=$1
        `,
        [
            user
        ]
    );





    const reputacion = await db.query(
        `
        SELECT AVG(stars)
        FROM market_reviews
        WHERE seller_id=$1
        `,
        [
            user
        ]
    );





    return {


        ventas:
        Number(
            ventas.rows[0].count
        ),



        publicaciones:
        Number(
            publicaciones.rows[0].count
        ),



        estrellas:
        reputacion.rows[0].avg
        ?
        Number(
            reputacion.rows[0].avg
        ).toFixed(1)
        :
        "Sin reseñas"


    };


}







module.exports = {

    crearVenta,

    obtenerVentas,

    obtenerVentasUsuario,

    retirarVenta,

    comprarVenta,

    obtenerEstadisticas

};