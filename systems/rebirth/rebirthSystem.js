const levels = require("./rebirthLevels");
const rebirthDB = require("../../database/rebirth/rebirthQueries");
const pointsDB = require("../../database/rebirth/pointsQueries");
console.log("🔎 pointsDB:", pointsDB);


async function hacerRebirth(db,user){

    const actual =
    await rebirthDB.obtenerRebirth(
        db,
        user.id
    );


    const siguiente = actual + 1;


    const precio = levels[siguiente];


    if(!precio){
        return {
            error:"max"
        };
    }


    const dinero = await db.query(
        `
        SELECT balance
        FROM users
        WHERE discord_id=$1
        `,
        [user.id]
    );


    if(dinero.rows[0].balance < precio){

        return {
            error:"money",
            precio
        };

    }



    await db.query(
        `
        UPDATE users
        SET balance = balance - $2
        WHERE discord_id=$1
        `,
        [
            user.id,
            precio
        ]
    );


    await rebirthDB.subirRebirth(
        db,
        user.id
    );


    await pointsDB.añadirPoints(
        db,
        user.id,
        1
    );


    return {
        success:true,
        rebirth:siguiente,
        precio
    };


}


module.exports={
    hacerRebirth
};