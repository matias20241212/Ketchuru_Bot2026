module.exports={

nombre:"deletecode",


async ejecutar(message,args,db){


if(!message.member.permissions.has("Administrator"))
return message.reply(
"❌ Sin permisos."
);



const codigo=args[0];


if(!codigo)
return message.reply(
"❌ Usa: !deletecode CODIGO"
);



await db.query(
`
DELETE FROM codes
WHERE code=$1
`,
[codigo.toUpperCase()]
);



message.reply(
`🗑️ Código eliminado: ${codigo}`
);


}


};