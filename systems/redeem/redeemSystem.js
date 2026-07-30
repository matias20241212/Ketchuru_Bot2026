const crypto = require("crypto");



function generarCodigo(){

    return crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase();

}



function generarRecompensa(){

    return Math.floor(
        Math.random() *
        (450000 - 30000 + 1)
        + 30000
    );

}



async function crearCodigo(db,usuario){


    let codigo;
    let existe;


    do {

        codigo = generarCodigo();


        existe = await db.query(
            `
            SELECT code
            FROM redeem_codes
            WHERE code=$1
            `,
            [codigo]
        );


    }while(existe.rows.length > 0);



    const recompensa = generarRecompensa();



    await db.query(
        `
        INSERT INTO redeem_codes
        (
        code,
        reward,
        created_by
        )

        VALUES
        ($1,$2,$3)
        `,
        [
            codigo,
            recompensa,
            usuario
        ]
    );



    return {
        codigo,
        recompensa
    };

}




module.exports={
    crearCodigo,
    generarCodigo,
    generarRecompensa
};