const feriaSystem =
require("../../systems/feria/feriaSystem");


module.exports={

nombre:"feria",


async ejecutar(message,args,db){


const feria =
await feriaSystem.abrirFeria();



if(!feria.abierta){

return message.reply(
"❌ La Feria está cerrada."
);

}



let texto =
"🎪 **FERIA KETCHURU**\n\n";



feria.objetos.forEach((x,i)=>{


texto +=
`
${i+1}) ${x.emoji}
${x.nombre}

⭐ ${x.rareza}

💰 ${x.precio}

📦 ${x.cantidad}

`;

});



message.reply(texto);



}

};