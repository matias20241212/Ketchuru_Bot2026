const db = require("../../database");


function calcularRecompensa(streak){

    let recompensa = 100 + (streak * 75);


    // Bonus cada semana
    if(streak % 7 === 0){
        recompensa += 250;
    }


    // Bonus mensual
    if(streak % 30 === 0){
        recompensa += 1000;
    }


    // Bonus anual
    if(streak % 365 === 0){
        recompensa += 10000;
    }


    return recompensa;

}



module.exports = {

    name: "daily",


    async execute(message){


        const userId = message.author.id;



        // Crear usuario si no existe
        await db.query(
            `
            INSERT INTO users
            (discord_id,balance)

            VALUES
            ($1,$2)

            ON CONFLICT (discord_id)
            DO NOTHING
            `,
            [
                userId,
                50
            ]
        );




        // Crear datos daily si no existe

        await db.query(
            `
            INSERT INTO daily_stats
            (
                discord_id,
                streak,
                active_today
            )

            VALUES
            ($1,0,false)

            ON CONFLICT(discord_id)
            DO NOTHING
            `,
            [
                userId
            ]
        );




        const data =
        await db.query(
            `
            SELECT *

            FROM daily_stats

            WHERE discord_id=$1
            `,
            [
                userId
            ]
        );



        const daily =
        data.rows[0];



        const ahora =
        new Date();



        let streak =
        daily.streak;



        if(daily.last_daily){


            const ultima =
            new Date(daily.last_daily);



            const horas =
            (ahora - ultima)
            /
            (1000*60*60);



            // Todavía no puede reclamar

            if(horas < 24){

                return message.reply(
`⏳ Ya reclamaste tu daily.

🔥 Racha actual:
${streak} días`
                );

            }



            // Pasaron 48 horas sin actividad

            if(
                horas >= 48 &&
                !daily.active_today
            ){

                streak = 0;

            }


        }




        // Nueva racha

        streak++;




        const recompensa =
        calcularRecompensa(streak);





        // Dar monedas

        await db.query(
            `
            UPDATE users

            SET balance = balance + $1

            WHERE discord_id=$2
            `,
            [
                recompensa,
                userId
            ]
        );




        // Guardar daily

        await db.query(
            `
            UPDATE daily_stats

            SET
            streak=$1,
            last_daily=NOW(),
            active_today=false

            WHERE discord_id=$2
            `,
            [
                streak,
                userId
            ]
        );





        message.reply(
`
🎁 **Daily reclamado**

🔥 Racha:
**${streak} días**

💰 Recompensa:
**${recompensa.toLocaleString()} monedas**

💡 Recuerda hablar en el servidor para mantener tu racha.
`
        );


    }

};