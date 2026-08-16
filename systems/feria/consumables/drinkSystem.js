const efectos =
require("./effectsSystem");



const bebidas = {


"🥤":{

nombre:"Bebida Hermes",

efecto:"monedas",

valor:10,

duracion:1800000

},


"⚡":{

nombre:"Bebida Zeus",

efecto:"suerte",

valor:15,

duracion:3600000

},


"☀️":{

nombre:"Bebida Apolo",

efecto:"feria",

valor:20,

duracion:3600000

},


"🍀":{

nombre:"Bebida Fortuna",

efecto:"apuestas",

valor:25,

duracion:1800000

}


};



async function usar(
usuario,
item,
db
){



const bebida =
bebidas[item];



if(!bebida){

return {

error:"No es una bebida"

};

}



await efectos.aplicarEfecto(
usuario.id,
bebida,
db
);



return {

success:true,

bebida

};



}



module.exports={

bebidas,

usar

};