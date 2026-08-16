const rebirthSystem = require("../../systems/rebirth/rebirthSystem");
const rebirthLevels = require("../../systems/rebirth/rebirthLevels");
const rebirthDB = require("../../database/rebirth/rebirthQueries");
const pointsDB = require("../../database/rebirth/pointsQueries");


module.exports = {

nombre:"rebirth",


async ejecutar(message,args,db){


const user = message.author;


const actual = await rebirthDB.obtenerRebirth(
    db,
    user.id
);


if(args[0] === "info"){

    const puntos = await pointsDB.obtenerPoints(
        db,
        user.id
    );


    const siguiente = actual + 1;


    return message.reply(
`
🌟 **REBIRTH**

⭐ Nivel actual:
${actual}

⬆️ Próximo:
${siguiente}

🪙 Precio:
${rebirthLevels[siguiente]
? rebirthLevels[siguiente].toLocaleString()
: "MÁXIMO"}

⭐ Rebirth Points:
${puntos}

✨ Bonus:
+${actual * 2}%
`
    );

}



const resultado =
await rebirthSystem.hacerRebirth(
    db,
    user
);



if(resultado.error==="max"){

return message.reply(
"🏆 Llegaste al máximo Rebirth."
);

}



if(resultado.error==="money"){

return message.reply(
`
❌ No tienes suficientes monedas.

Necesitas:
🪙 ${resultado.precio.toLocaleString()}
`
);

}



message.reply(
`
🌟 **REBIRTH COMPLETADO**

🔥 Nuevo nivel:
${resultado.rebirth}

⭐ Rebirth Points:
+1

✨ Bonus:
+${resultado.rebirth * 2}%

`
);


}

};