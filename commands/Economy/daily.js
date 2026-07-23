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
            (
                discord_id,
                balance
            )

            VALUES
            ($1,$2)

            ON CONFLICT(discord_id)
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
                last_claim,
                active_today
            )

            VALUES
            ($1,0,NULL,false)

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
        daily.streak || 0;





        // Revisar tiempo desde último daily

        if(daily.last_claim){


            const ultima =
            new Date(daily.last_claim);



            const horas =
            (ahora - ultima)
            /
            (1000 * 60 * 60);




            // Todavía tiene cooldown

            if(horas < 24){

                const faltan =
                Math.ceil(24 - horas);


                return message.reply(
`
⏳ **Ya reclamaste tu Daily**

🔥 Racha actual:
**${streak} días**

⌛ Próximo Daily en:
**${faltan} horas**
`
                );

            }





            // Perdió la racha por no volver

            if(horas >= 48){

                streak = 0;

            }


        }





        // Aumentar racha

        streak++;





        const recompensa =
        calcularRecompensa(streak);






        // Dar monedas al balance

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







        // Guardar datos del daily

        await db.query(
            `
            UPDATE daily_stats

            SET
            streak=$1,
            last_claim=NOW(),
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

📅 Próximo Daily:
En 24 horas

💡 Mantén tu actividad para no perder la racha.
`
        );



    }

};