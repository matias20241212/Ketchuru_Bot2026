const marketSystem = require("../../systems/market/marketSystem");
const db = require("../../database");

module.exports = {

name:"sell",



async ejecutar(message,args){



    if(args.length < 3){

        return message.reply(
`
❌ Uso incorrecto.

Ejemplo:

!sell 🍩 x3 c/u 25000
`
        );

    }




    const item =
    args[0];



    let cantidadTexto =
    args[1];



    if(!cantidadTexto.startsWith("x")){


        return message.reply(
            "❌ La cantidad debe ser x1, x2, x3..."
        );


    }




    const cantidad =
    parseInt(
        cantidadTexto.replace("x","")
    );



    if(
    isNaN(cantidad) ||
    cantidad <= 0
    ){

        return message.reply(
            "❌ Cantidad inválida."
        );

    }





    let precioPosicion = 2;




    if(
    args[2].toLowerCase() === "c/u"
    ){

        precioPosicion = 3;

    }






    const precio =
    parseInt(
        args[precioPosicion]
    );



    if(isNaN(precio)){


        return message.reply(
            "❌ Precio inválido."
        );


    }

// Revisar objetos ya publicados

const bloqueado = await db.query(
`
SELECT SUM(amount) as cantidad
FROM market_locks
WHERE user_id=$1
AND item=$2
`,
[
message.author.id,
item
]
);


const cantidadBloqueada =
Number(
bloqueado.rows[0].cantidad || 0
);



const inventario = await db.query(
`
SELECT amount
FROM inventory
WHERE discord_id=$1
AND item=$2
`,
[
message.author.id,
item
]
);



const disponible =
Number(
inventario.rows[0]?.amount || 0
);



if(cantidad > disponible){

return message.reply(
`
❌ No tienes esa cantidad disponible.

📦 Tienes:
${disponible}

🔒 Vendiendo:
${cantidadBloqueada}
`
);

}

    const resultado =
    await marketSystem.crearVenta(

        message.author.id,

        item,

        cantidad,

        precio,

        null

    );






    if(!resultado.success){


        return message.reply(
            resultado.message
        );


    }







    message.reply(
`
🏪 Objeto puesto en el 𝖕𝖊𝖗𝖘𝖆

📦 ${item} x${cantidad}

💰 ${precio.toLocaleString()}🪙 c/u

✅ Otros usuarios pueden comprarlo ahora.
`
    );



}

};