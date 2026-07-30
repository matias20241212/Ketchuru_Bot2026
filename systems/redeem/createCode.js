const redeemSystem =
require("../../systems/redeem/redeemSystem");


module.exports={


nombre:"createcode",



async ejecutar(message,args,db){


if(!message.member.permissions.has("Administrator"))
return message.reply(
"❌ No tienes permisos."
);



const resultado =
await redeemSystem.crearCodigo(
db,
message.author.id
);



message.reply(
`
🎉 **Código creado**

🎟️ Código:
\`${resultado.codigo}\`

🪙 Recompensa:
${resultado.recompensa.toLocaleString()} monedas
`
);



}


};