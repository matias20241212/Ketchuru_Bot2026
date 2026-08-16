const schedule = require("./feriaSchedule");
const stock = require("./feriaStock");

const feriaButtons = require("./feriaButtons");
const feriaBuy = require("./feriaBuy");

const bets = require("./bets/betsSystem");

const drinks = require("./consumables/drinkSystem");


const CANAL_FERIA = "1535073298470281297";


let feriaEnviada = false;



async function iniciarFeria(client){


    if(!schedule.feriaActiva()){

        feriaEnviada = false;
        return;

    }



    // Evita enviar el mensaje muchas veces

    if(feriaEnviada)
    return;



    feriaEnviada = true;



    const canal =
    await client.channels.fetch(
        CANAL_FERIA
    ).catch(()=>null);



    if(!canal){

        console.log(
            "❌ Canal de Feria no encontrado"
        );

        return;

    }



    // Generar objetos

    const objetos =
    stock.generarStock();



    let mensaje =
`
🎪 **FERIA DE KETCHURU ABIERTA**

✨ La feria ya abrió.

🛒 Objetos disponibles:

`;



    objetos.forEach((item,i)=>{


        mensaje +=
`
${i+1}) ${item.emoji} **${item.nombre}**

⭐ Rareza:
${item.rareza}

💰 Precio:
${item.precio.toLocaleString()} 🪙

📦 Stock:
${item.cantidad}

`;

    });



    mensaje +=
`
🎲 También hay apuestas disponibles.

🥤 Bebidas y consumibles activos.

⏰ La feria cerrará automáticamente.
`;



    const botones =
    feriaButtons.crearBotones(
        objetos
    );



    await canal.send({

        content:mensaje,

        components:[
            botones
        ]

    });


}




async function cerrarFeria(client){


    const canal =
    await client.channels.fetch(
        CANAL_FERIA
    ).catch(()=>null);



    if(!canal)
    return;



    await canal.send(
`
🎪 **FERIA CERRADA**

Gracias por visitar la feria de Ketchuru.

Los objetos volverán en la próxima apertura.
`
    );



}





async function comprar(
usuario,
objeto,
db
){


return await feriaBuy.comprar(

    usuario,
    objeto,
    db

);


}





async function jugarApuesta(
usuario,
apuesta,
db
){


return await bets.jugar(

usuario,
apuesta,
db

);


}




async function usarBebida(
usuario,
item,
db
){


return await drinks.usar(

usuario,
item,
db

);


}





module.exports={

    iniciarFeria,

    cerrarFeria,

    comprar,

    jugarApuesta,

    usarBebida

};