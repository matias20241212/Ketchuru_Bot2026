const db = require("../database");
const { addItem } = require("./inventory");



// =========================
// 🎁 DAR RECOMPENSA
// =========================

async function darRecompensa(userId, mision){



    // 🪙 MONEDAS

    if(mision.reward_type === "coins"){


        await db.query(
        `
        UPDATE users

        SET balance = balance + $1

        WHERE discord_id=$2
        `,
        [
            mision.reward_coins || 0,
            userId
        ]);



        return {

            tipo:"coins",

            cantidad:mision.reward_coins

        };


    }





    // 🎁 OBJETO

    if(mision.reward_type === "item"){



        await addItem(
            userId,
            mision.reward_item,
            1
        );



        return {


            tipo:"item",

            item:mision.reward_item,

            rareza:mision.reward_rarity


        };


    }





    // 🎟️ CUPÓN

    if(mision.reward_type === "coupon"){



        await db.query(
        `
        INSERT INTO user_coupons
        (
        discord_id,
        discount
        )

        VALUES
        ($1,$2)
        `,
        [

        userId,

        mision.reward_coupon

        ]);



        return {


            tipo:"coupon",

            descuento:mision.reward_coupon


        };


    }



    return null;


}







// =========================
// 📜 AVANZAR MISIÓN
// =========================

async function avanzarMision(userId,tipo){



const result = await db.query(
`
SELECT

user_missions.id,

user_missions.progress,

missions.name,

missions.goal,

missions.reward_type,

missions.reward_coins,

missions.reward_item,

missions.reward_rarity,

missions.reward_coupon


FROM user_missions


JOIN missions

ON missions.id=user_missions.mission_id


WHERE user_missions.discord_id=$1

AND missions.type=$2

AND user_missions.completed=false


LIMIT 1
`,
[
userId,
tipo
]);





if(result.rows.length===0){

return null;

}





const mision=result.rows[0];



const progreso =
mision.progress + 1;





// =========================
// ✅ COMPLETADA
// =========================

if(progreso >= mision.goal){



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
mision.goal,

mision.id
]);





const recompensa =
await darRecompensa(
userId,
mision
);





return {


completada:true,


nombre:mision.name,


recompensa,


tipo:mision.reward_type,


item:mision.reward_item,


rareza:mision.reward_rarity,


coupon:mision.reward_coupon


};


}







// =========================
// 📊 PROGRESO NORMAL
// =========================


await db.query(
`
UPDATE user_missions

SET progress=$1

WHERE id=$2
`,
[
progreso,

mision.id
]);





return null;



}






module.exports={

avanzarMision

};