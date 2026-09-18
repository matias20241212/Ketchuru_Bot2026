const redeemManager = require("../../systems/redeem/redeemManager");


module.exports = {

nombre:"redeem",


async ejecutar(message,args,db){


const codigo = args[0];


if(!codigo){

return message.reply(
"❌ Usa: !redeem CODIGO"
);

}



const resultado =
await redeemManager.canjearCodigo(
db,
message.author.id,
codigo.toUpperCase()
);



if(!resultado.ok){

return message.reply(
`❌ ${resultado.mensaje}`
);

}



message.reply(
`
🎉 **Código canjeado**

🪙 Ganaste:
${resultado.reward.toLocaleString()} monedas
`
);



}


};