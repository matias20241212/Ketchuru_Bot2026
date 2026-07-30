module.exports={

nombre:"code",


async ejecutar(message,args,db){


const datos =
await db.query(
`
SELECT code,reward
FROM codes
ORDER BY created_at DESC
LIMIT 10
`
);



if(datos.rows.length===0)
return message.reply(
"❌ No hay códigos activos."
);



let texto =
"🎟️ **Códigos disponibles**\n\n";



datos.rows.forEach(c=>{


texto+=
`
\`${c.code}\`
🪙 ${c.reward.toLocaleString()}

`;

});


message.reply(texto);


}


};