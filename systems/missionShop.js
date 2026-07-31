const db = require("../database");
const { DateTime } = require("luxon");


// =================================
// 🎯 GENERAR 5 MISIONES DIARIAS
// =================================

async function generarMisionesDiarias(){


    const usuarios = await db.query(
        `
        SELECT discord_id
        FROM users
        `
    );


    console.log(
        `🎯 Actualizando misiones para ${usuarios.rows.length} usuarios`
    );



    for(const usuario of usuarios.rows){


        const id = usuario.discord_id;



        // borrar misiones antiguas

        await db.query(
            `
            DELETE FROM user_missions
            WHERE discord_id=$1
            `,
            [
                id
            ]
        );



        // elegir 5 aleatorias

        const misiones = await db.query(
            `
            SELECT id
            FROM missions
            ORDER BY RANDOM()
            LIMIT 5
            `
        );



        for(const m of misiones.rows){


            await db.query(
                `
                INSERT INTO user_missions
                (
                discord_id,
                mission_id,
                progress,
                completed,
                rewarded
                )

                VALUES
                (
                $1,
                $2,
                0,
                false,
                false
                )
                `,
                [
                    id,
                    m.id
                ]
            );


        }



    }


}




// =================================
// ⏰ PRÓXIMA MISIÓN GLOBAL
// =================================


function getNextMissionReset(){


const now = DateTime.now()
.setZone("America/Santiago");



let reset = now.set({

hour:16,
minute:0,
second:0,
millisecond:0

});



if(reset <= now){

reset = reset.plus({
    days:1
});

}



return reset;


}




function getMissionTimestamp(){


return `<t:${Math.floor(
getNextMissionReset().toSeconds()
)}:t>`;


}



module.exports={

generarMisionesDiarias,
getMissionTimestamp

};