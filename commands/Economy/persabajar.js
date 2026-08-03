const marketSystem = require("../../systems/market/marketSystem");


module.exports = {

name:"persabajar",



async ejecutar(message,args){


    const item = args[0];



    if(!item){

        return message.reply(
`
❌ Especifica el objeto.

Ejemplo:

!persabajar 🍩

o

!persabajar 🍩 x2
`
        );

    }




    let cantidad = null;



    if(args[1]){


        if(args[1].startsWith("x")){


            cantidad =
            parseInt(
                args[1].replace("x","")
            );


        }

    }






    const resultado =
    await marketSystem.retirarVenta(

        message.author.id,

        item,

        cantidad

    );






    if(!resultado){


        return message.reply(
            "❌ No tienes ese objeto publicado en el Persa."
        );


    }






    message.reply(
`
⬇️ Publicación retirada

📦 Objeto:
${item}

✅ Fue devuelto a tu inventario.
`
    );



}

};