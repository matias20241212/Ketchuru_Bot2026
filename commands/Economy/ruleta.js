const ruleta = require("../../systems/ruleta/ruletaSystem");
const db = require("../../database");


module.exports = {

    name: "ruleta",

    description: "Juega a la ruleta Ketchuru",


    async execute(message, args){


        const userId = message.author.id;



        const bet = Number(args[0]);



        if(!bet){

            return message.reply(
                "🎰 Usa: `!ruleta <cantidad>`\nEjemplo: `!ruleta 1000`"
            );

        }



        if(isNaN(bet)){

            return message.reply(
                "❌ La apuesta debe ser un número."
            );

        }



        try{


            const user =
            await db.query(
                `
                SELECT balance
                FROM users
                WHERE discord_id = $1
                `,
                [
                    userId
                ]
            );



            if(user.rows.length === 0){

                await db.query(
                    `
                    INSERT INTO users
                    (
                        discord_id,
                        balance
                    )

                    VALUES
                    (
                        $1,
                        50
                    )
                    `,
                    [
                        userId
                    ]
                );

            }



            const data =
            await db.query(
                `
                SELECT balance
                FROM users
                WHERE discord_id = $1
                `,
                [
                    userId
                ]
            );



            const balance =
            Number(
                data.rows[0].balance
            );



            if(balance < bet){

                return message.reply(
                    "❌ No tienes suficientes monedas."
                );

            }



            await db.query(
                `
                UPDATE users
                SET balance = balance - $1
                WHERE discord_id = $2
                `,
                [
                    bet,
                    userId
                ]
            );



            await ruleta.start(
                message,
                bet
            );



        }
        catch(error){

            console.log(
                "Error ruleta:",
                error
            );


            message.reply(
                "❌ Error iniciando la ruleta."
            );

        }


    }

};