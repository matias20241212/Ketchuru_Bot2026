const dbRebirth =
require("../../database/rebirth/rebirthQueries");


module.exports={

nombre:"rebirthinfo",


async ejecutar(message,args,db){


const datos =
await dbRebirth.obtenerDatosRebirth(
db,
message.author.id
);



message.reply(
`
🌟 **REBIRTH INFO**

⭐ Nivel:
${datos.rebirth}

⭐ Rebirth Points:
${datos.rebirth_points}

✨ Bonus:
+${datos.rebirth * 2}%

`
);


}

};