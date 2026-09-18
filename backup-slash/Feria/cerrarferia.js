module.exports={

nombre:"cerrarferia",


async ejecutar(message,args,db){


if(!message.member.permissions.has(
"Administrator"
))

return message.reply(
"❌ Sin permisos."
);



const canal =
await message.client.channels.fetch(
"1535073298470281297"
);



await canal.send(
`
🎪 **FERIA CERRADA**

La Feria ha sido cerrada por administración.

⏳ Espera la próxima apertura.
`
);



message.reply(
"✅ Feria cerrada correctamente."
);



}

};