const tienda =
require("../../systems/rebirth/rebirthShop");

const points =
require("../../database/rebirth/pointsQueries");


module.exports={

nombre:"rebirthshop",


async ejecutar(message,args,db){


if(!args[0]){

let texto="⭐ REBIRTH SHOP\n\n";


for(let id in tienda){

texto+=
`${id}) ${tienda[id].nombre}
⭐ ${tienda[id].precio} puntos

`;

}

return message.reply(texto);

}



const item = tienda[args[0]];


if(!item)
return message.reply(
"❌ Item inexistente."
);



const cantidad =
await points.obtenerPoints(
db,
message.author.id
);


if(cantidad < item.precio)
return message.reply(
"❌ No tienes suficientes puntos."
);



await db.query(
`
UPDATE users
SET rebirth_points =
rebirth_points - $2,

${item.columna} =
COALESCE(${item.columna},0)+$3

WHERE discord_id=$1
`,
[
message.author.id,
item.precio,
item.cantidad
]
);



message.reply(
`
✅ Compra realizada

⭐ ${item.nombre}

Pagaste:
${item.precio} Rebirth Points
`
);


}

};