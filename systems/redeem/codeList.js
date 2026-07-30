module.exports={


nombre:"code",


async ejecutar(message,args,db){



const datos =
await db.query(
`
SELECT code,reward

FROM redeem_codes

WHERE active=true

ORDER BY created_at DESC

LIMIT 20
`
);



if(datos.rows.length===0)
return message.reply(
"❌ No hay códigos activos."
);



let texto=
"🎟️ **Códigos activos**\n\n";



datos.rows.forEach(c=>{


texto+=
`
\`${c.code}\`
🪙 ${Number(c.reward).toLocaleString()}

`;

});



message.reply(texto);


}



};