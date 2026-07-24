const db = require("../database");


// =========================
// 🎁 OBJETOS RECOMPENSA
// =========================

const objetos = [


{
emoji:"🍎",
rarity:"Common"
},

{
emoji:"🍒",
rarity:"Uncommon"
},

{
emoji:"🍊",
rarity:"Rare"
},

{
emoji:"🔥",
rarity:"Epic"
},

{
emoji:"🚀",
rarity:"Legendary"
},

{
emoji:"🍰",
rarity:"Mythic"
},


{
emoji:"💀",
rarity:"Secret Bad"
},


// SECRET MEDIUM

{
emoji:"🌪️",
rarity:"Secret Medium"
},

{
emoji:"🧊",
rarity:"Secret Medium"
},

{
emoji:"🌑",
rarity:"Secret Medium"
},

{
emoji:"🌫️",
rarity:"Secret Medium"
},

{
emoji:"🪐",
rarity:"Secret Medium"
},

{
emoji:"🌘",
rarity:"Secret Medium"
},

{
emoji:"🧬",
rarity:"Secret Medium"
},

{
emoji:"🛸",
rarity:"Secret Medium"
},

{
emoji:"🌋",
rarity:"Secret Medium"
},

{
emoji:"🌀",
rarity:"Secret Medium"
}


];





// =========================
// 🎯 TIPOS DE MISIONES
// =========================


const tipos = [


{
type:"slots",
nombres:[
"Jugador de tragamonedas",
"Maestro de la suerte",
"Rey del casino"
],
goals:[
10,25,50,100
]
},



{
type:"buy",
nombres:[
"Comprador novato",
"Cazador de objetos",
"Rey de la tienda"
],
goals:[
5,10,25,50
]
},



{
type:"messages",
nombres:[
"Chat activo",
"Conversador",
"Spam controlado"
],
goals:[
50,100,250,500
]
}


];








function random(arr){

return arr[
Math.floor(
Math.random()*arr.length
)
];

}





function crearRecompensa(){



const chance =
Math.random();


// 60% monedas

if(chance < 0.60){


return {

type:"coins",

coins:
Math.floor(
Math.random()*2000
)+100

};


}





// 25% objetos

if(chance < 0.85){


const item =
random(objetos);



return {


type:"item",

item:item.emoji,

rarity:item.rarity


};


}





// 15% cupones


return {


type:"coupon",

coupon:
Math.floor(
Math.random()*21
)+10


};



}









async function generarMisiones(userId){



const actuales =
await db.query(
`
SELECT *
FROM user_missions

WHERE discord_id=$1

AND completed=false
`,
[
userId
]);




if(actuales.rows.length >= 5){

return;

}







const cantidad =
5 - actuales.rows.length;







const nuevas =
[];







for(let i=0;i<cantidad;i++){



const mision =
random(tipos);



const nombre =
random(
mision.nombres
);



const goal =
random(
mision.goals
);




const recompensa =
crearRecompensa();







const insert =
await db.query(
`
SELECT id
FROM missions

ORDER BY RANDOM()

LIMIT 1
`
);







const missionId =
insert.rows[0].id;







await db.query(
`
INSERT INTO user_missions

(
discord_id,
mission_id,
progress,
completed,
rewarded,
reward_type,
reward_item,
reward_rarity,
reward_coupon,
reward_coins
)

VALUES

(
$1,$2,0,false,false,
$3,$4,$5,$6,$7
)

`,
[

userId,

missionId,

recompensa.type,

recompensa.item || null,

recompensa.rarity || null,

recompensa.coupon || null,

recompensa.coins || null

]);





}



}




module.exports={

generarMisiones

};