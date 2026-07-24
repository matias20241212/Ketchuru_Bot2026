const db = require("../database");


async function avanzarMision(userId, tipo){


    const mision = await db.query(
        `
        SELECT
        user_missions.id,
        user_missions.progress,
        missions.goal,
        missions.reward,
        missions.name

        FROM user_missions

        JOIN missions
        ON missions.id = user_missions.mission_id

        WHERE user_missions.discord_id=$1
        AND missions.type=$2
        AND user_missions.completed=false

        LIMIT 1
        `,
        [
            userId,
            tipo
        ]
    );


    if(mision.rows.length === 0){
        return null;
    }



    const data = mision.rows[0];


    const nuevoProgreso = data.progress + 1;



    if(nuevoProgreso >= data.goal){


        await db.query(
            `
            UPDATE user_missions

            SET
            progress=$1,
            completed=true,
            rewarded=true

            WHERE id=$2
            `,
            [
                data.goal,
                data.id
            ]
        );



        await db.query(
            `
            UPDATE users

            SET balance = balance + $1

            WHERE discord_id=$2
            `,
            [
                data.reward,
                userId
            ]
        );



        return {
            completada:true,
            nombre:data.name,
            recompensa:data.reward
        };

    }



    await db.query(
        `
        UPDATE user_missions

        SET progress=$1

        WHERE id=$2
        `,
        [
            nuevoProgreso,
            data.id
        ]
    );


    return null;


}



module.exports = {
    avanzarMision
};