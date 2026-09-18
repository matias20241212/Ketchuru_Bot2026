const marketSystem = require("../../systems/market/marketSystem");


module.exports = {

    name:"comprar",


    async ejecutar(message,args){


        const vendedor =
        message.mentions.users.first();



        if(!vendedor){

            return message.reply(
`
❌ Especifica el vendedor.

Ejemplo:
!comprar @usuario 🍩
`
            );

        }



        let itemArg = args[1];


        if(!itemArg){

            return message.reply(
                "❌ Especifica el objeto."
            );

        }



        let cantidad = 1;
        let item = itemArg;



        // Detectar x2🍩

        if(itemArg.startsWith("x")){


            const numero =
            itemArg.match(/\d+/);



            cantidad =
            parseInt(numero[0]);



            item =
            itemArg.replace(
                `x${cantidad}`,
                ""
            );

        }





        const resultado =
        await marketSystem.comprarVenta(
            message.author.id,
            vendedor.id,
            item,
            cantidad
        );





        if(!resultado.success){

            return message.reply(
                resultado.message
            );

        }






        message.reply(
`
🛒 **Compra realizada**

📦 Objeto:
${item} x${cantidad}

💰 Pagaste:
${resultado.precio.toLocaleString()}🪙

👤 Vendedor:
${vendedor}

✅ Objeto añadido a tu inventario.
`
        );





        try{

            vendedor.send(
`
💰 **¡Vendiste un objeto!**

📦 ${item} x${cantidad}

💵 Ganaste:
${resultado.precio.toLocaleString()}🪙
`
            );

        }catch{}




    }

};