const express = require("express");
const router = express.Router();

const db = require("../../database");


router.get("/ranking", async (req,res)=>{

    try{

        const resultado = await db.query(`
            SELECT discord_id, balance
            FROM users
            ORDER BY balance DESC
            LIMIT 10;
        `);


        res.json(resultado.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error obteniendo ranking"
        });

    }

});


module.exports = router;