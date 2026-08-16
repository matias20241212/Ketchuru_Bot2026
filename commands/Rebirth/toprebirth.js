module.exports={

nombre:"toprebirth",


async ejecutar(message,args,db){


const resultado =
await db.query(
`
SELECT discord_id, rebirth
FROM users
ORDER BY rebirth DESC
LIMIT 10
`
);


let texto =
"🏆 **TOP REBIRTH**\n\n";


let puesto=1;


for(const user of resultado.rows){


texto+=
`
${puesto}º <@${user.discord_id}>
🌟 Rebirth:
${user.rebirth}

`;

puesto++;

}



message.reply(texto);


}

};