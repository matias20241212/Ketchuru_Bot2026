const generator =
require("./betsGenerator");



function obtenerApuestas(){


return generator.generarApuestas();


}



async function jugar(
usuario,
apuesta,
db
){



const lista =
generator.apuestas;



const juego =
lista.find(
x=>x.id===apuesta
);



if(!juego){

return {

error:"No existe esa apuesta"

};

}




const resultado =
Math.random()*100;



if(resultado <= juego.probabilidad){



if(juego.tipo==="monedas"){


await db.query(
`
UPDATE users

SET balance =
balance + $2

WHERE discord_id=$1
`,
[
usuario.id,
juego.premio
]
);


return {

ganado:true,

premio:
`${juego.premio.toLocaleString()} 🪙`

};


}



return {

ganado:true,

premio:
juego.premio

};



}



return {

ganado:false,

premio:null

};


}



module.exports={

obtenerApuestas,

jugar

};