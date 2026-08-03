const db = require("../../database");



async function guardarReview(
    vendedor,
    comprador,
    estrellas,
    comentario
){

    await db.query(
    `
    INSERT INTO market_reviews
    (
        seller_id,
        buyer_id,
        stars,
        comment
    )

    VALUES
    ($1,$2,$3,$4)
    `,
    [
        vendedor,
        comprador,
        estrellas,
        comentario
    ]
    );

}





async function obtenerPromedio(vendedor){


    const resultado =
    await db.query(
    `
    SELECT AVG(stars)
    FROM market_reviews
    WHERE seller_id=$1
    `,
    [
        vendedor
    ]
    );



    if(!resultado.rows[0].avg){

        return "Sin reseñas";

    }



    return Number(
        resultado.rows[0].avg
    ).toFixed(1);


}




module.exports={

    guardarReview,

    obtenerPromedio

};