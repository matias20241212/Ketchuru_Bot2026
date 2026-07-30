module.exports={


nombre:"deletecode",


async ejecutar(message,args,db){


if(!message.member.permissions.has("Administrator"))
return message.reply(
"❌ No tienes permisos."
);



const codigo=args[0];


if(!codigo)
return message.reply(
"Uso: !deletecode CODIGO"
);



await db.query(
`
UPDATE redeem_codes

SET active=false

WHERE code=$1
`,
[
codigo.toUpperCase()
]
);



message.reply(
`🗑️ Código eliminado: ${codigo}`
);



}


};