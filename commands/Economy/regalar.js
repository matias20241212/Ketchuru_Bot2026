const giftSystem = require("../../systems/gifts/giftSystem");


module.exports={

name:"regalar",


async ejecutar(message,args){


    const user = message.mentions.users.first();


    if(!user)
        return message.reply(
            "❌ Menciona a quien quieres regalar."
        );



    let cantidad=1;


    let item=args[0];



    if(item.startsWith("x")){

        cantidad=parseInt(
            item.replace("x","")
        );

        item=args[1];

    }



    if(!item)
        return message.reply(
            "❌ Especifica el objeto."
        );




    const result =
    await giftSystem.crearRegalo(
        message.author.id,
        user.id,
        item,
        cantidad
    );



    if(!result.success)
        return message.reply(
            result.message
        );



    message.reply(
`
🎁 Regalo enviado

📦 Objeto:
${item} x${cantidad}

👤 Usuario:
${user}
`
);



}

};