const marketSystem = require("../../systems/market/marketSystem");
const db = require("../../database");

module.exports = {

name:"persasubir",


async ejecutar(message,args){


    if(args.length < 3){

        return message.reply(
`
❌ Uso incorrecto.

Ejemplo:

!persasubir 🍩 x3 c/u 25000
`
        );

    }



    const item = args[0];



    let cantidadTexto = args[1];



    if(!cantidadTexto.startsWith("x")){

        return message.reply(
            "❌ La cantidad debe ser así: x3"
        );

    }



    const cantidad =
    parseInt(
        cantidadTexto.replace("x","")
    );



    if(isNaN(cantidad) || cantidad <= 0){

        return message.reply(
            "❌ Cantidad inválida."
        );

    }




    let precioIndex = 2;



    // Si pone c/u lo saltamos

    if(args[2].toLowerCase() === "c/u"){

        precioIndex = 3;

    }




    const precio =
    parseInt(args[precioIndex]);



    if(isNaN(precio)){

        return message.reply(
            "❌ Precio inválido."
        );

    }



    // Nota opcional

    let nota = null;


    if(args.length > precioIndex + 1){

        nota =
        args
        .slice(precioIndex + 1)
        .join(" ");

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




// Revisar inventario actual

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
❌ No puedes publicar esa cantidad.

📦 Disponible:
${disponible}

🔒 Objetos en el Persa:
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

        nota

    );




    if(!resultado.success){

        return message.reply(
            resultado.message
        );

    }




    message.reply(
`
🏪 Publicación creada en el 𝖕𝖊𝖗𝖘𝖆

📦 Objeto:
${item} x${cantidad}

💰 Precio:
${precio.toLocaleString()}🪙 c/u

${nota ? "📝 "+nota : ""}
`
    );


}

};