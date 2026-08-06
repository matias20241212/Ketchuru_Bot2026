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



function calcularExpiracion(duracion){

    if(duracion === "siempre"){
        return null;
    }


    const numero = parseInt(duracion);

    const tipo = duracion.slice(-1);


    const fecha = new Date();


    if(tipo === "h"){
        fecha.setHours(
            fecha.getHours() + numero
        );
    }


    if(tipo === "d"){
        fecha.setDate(
            fecha.getDate() + numero
        );
    }


    if(tipo === "m"){
        fecha.setMonth(
            fecha.getMonth() + numero
        );
    }


    if(tipo === "y"){
        fecha.setFullYear(
            fecha.getFullYear() + numero
        );
    }


    return fecha;

}



async function crearCodigo(
    db,
    codigoPersonalizado,
    duracion,
    recompensa,
    usuario
){

    let codigo = codigoPersonalizado;


    if(!codigo){

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

    }



    const expiresAt = calcularExpiracion(duracion);



    await db.query(
        `
        INSERT INTO redeem_codes
        (
        code,
        reward,
        created_by,
        expires_at
        )

        VALUES
        ($1,$2,$3,$4)
        `,
        [
            codigo.toUpperCase(),
            recompensa,
            usuario,
            expiresAt
        ]
    );



    return {
        codigo: codigo.toUpperCase(),
        recompensa,
        expiresAt
    };

}



module.exports={
    crearCodigo,
    generarCodigo,
    generarRecompensa
};