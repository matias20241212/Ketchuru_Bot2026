const { addItem } = require("../../systems/inventory");
const { getShop } = require("../../systems/shop");
const { avanzarMision } = require("../../systems/missionProgress");
const db = require("../../database");



module.exports = {


name:"buy",



async execute(message,args){



const userId =
message.author.id;



if(!args[0]){


return message.reply(
"❌ Ejemplo: !buy 🍎"
);


}




const emoji = args[0];



const usarCupon =
args[1] === "coupon";





// =========================
// 🛒 TIENDA ACTUAL
// =========================


const currentShop =
getShop();



const item =
currentShop.find(
i=>i.emoji===emoji
);




if(!item){


return message.reply(
"❌ Este objeto no está actualmente en la tienda."
);


}




// =========================
// 📦 STOCK
// =========================


if(item.stock<=0){


return message.reply(
`
❌ Sin stock

${item.emoji} no está disponible.

🛒 Espera el próximo restock.
`
);


}





// =========================
// 💰 BALANCE
// =========================


let result =
await db.query(
`
SELECT balance
FROM users
WHERE discord_id=$1
`,
[userId]
);




if(result.rows.length===0){


await db.query(
`
INSERT INTO users
(discord_id,balance)

VALUES
($1,$2)
`,
[
userId,
50
]
);



result =
await db.query(
`
SELECT balance
FROM users
WHERE discord_id=$1
`,
[userId]
);


}





let balance =
Number(result.rows[0].balance);





// =========================
// 🎟️ CUPÓN
// =========================


let descuento = 0;



if(usarCupon){



const cupon =
await db.query(
`
SELECT id,discount

FROM user_coupons

WHERE discord_id=$1

LIMIT 1
`,
[
userId
]
);





if(cupon.rows.length===0){


return message.reply(
"❌ No tienes cupones disponibles."
);


}





descuento =
cupon.rows[0].discount;





await db.query(
`
DELETE FROM user_coupons

WHERE id=$1
`,
[
cupon.rows[0].id
]
);





}





// =========================
// 💸 PRECIO FINAL
// =========================


let precioFinal =
item.price;




if(descuento>0){


precioFinal =
Math.floor(
item.price -
(item.price*(descuento/100))
);


}





if(balance < precioFinal){


return message.reply(
`
❌ No tienes suficientes monedas.

Necesitas:
${precioFinal}🪙
`
);


}





// =========================
// 🛒 COMPRA
// =========================


balance -= precioFinal;



item.stock -=1;



addItem(
userId,
item.emoji,
1
);





// =========================
// 🎯 MISIÓN BUY
// =========================


const mision =
await avanzarMision(
userId,
"buy"
);



let mensajeMision="";



if(mision){


mensajeMision =
`
🎉 **MISIÓN COMPLETADA**

🛒 ${mision.nombre}

🎁 ${mision.recompensaTexto}
`;

}





// =========================
// 💾 GUARDAR
// =========================


await db.query(
`
UPDATE users

SET balance=$1

WHERE discord_id=$2
`,
[
balance,
userId
]
);







return message.reply(
`
✅ **Compra realizada**

🎁 Objeto:
${item.emoji}

💰 Precio original:
${item.price}🪙


${descuento>0
?
`🎟️ Descuento aplicado:
-${descuento}%`
:""
}


💸 Precio pagado:
${precioFinal}🪙


📦 Stock restante:
${item.stock}


💳 Balance:
${balance}🪙


${mensajeMision}

`
);



}


};