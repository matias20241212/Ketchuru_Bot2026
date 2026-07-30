module.exports={

nombre:"historialcode",


async ejecutar(message,args,db){


const datos =
await db.query(
`
SELECT *
FROM redeem_codes
ORDER BY created_at DESC
LIMIT 15
`
);



let texto=
"📜 **Historial de códigos**\n\n";



datos.rows.forEach(c=>{


texto+=
`
🎟️ ${c.code}
🪙 ${c.reward.toLocaleString()}
👤 <@${c.created_by}>

`;

});


message.reply(texto);


}


};