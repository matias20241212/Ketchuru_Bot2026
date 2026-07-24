const db = require("../database");


async function generarMisionesUsuario(userId){


    // comprobar si ya tiene misiones activas

    const existe = await db.query(
        `
        SELECT *
        FROM user_missions
        WHERE discord_id=$1
        AND expires_at > NOW()
        `,
        [
            userId
        ]
    );


    if(existe.rows.length > 0){
        return;
    }



    // elegir 3 misiones aleatorias

    const misiones = await db.query(
        `
        SELECT *
        FROM missions
        ORDER BY RANDOM()
        LIMIT 3
        `
    );



    for(const mision of misiones.rows){


        await db.query(
            `
            INSERT INTO user_missions
            (
                discord_id,
                mission_id,
                expires_at
            )

            VALUES
            (
                $1,
                $2,
                NOW() + INTERVAL '24 hours'
            )
            `,
            [
                userId,
                mision.id
            ]
        );

    }


}


module.exports = {
    generarMisionesUsuario
};