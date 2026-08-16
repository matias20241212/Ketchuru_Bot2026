const {obtenerRareza}
=
require("./raritySystem");


const objetos = [

{
emoji:"🪶",
nombre:"Pluma de Hermes",
rareza:"Hermes",
precio:5000,
stock:10,
poder:null
},


{
emoji:"🏛️",
nombre:"Pergamino de Atenea",
rareza:"Atenea",
precio:25000,
stock:5,
poder:"cupón_atenea"
},


{
emoji:"⚔️",
nombre:"Espada de Ares",
rareza:"Ares",
precio:50000,
stock:3,
poder:"ira_ares"
},


{
emoji:"☀️",
nombre:"Luz de Apolo",
rareza:"Apolo",
precio:150000,
stock:2,
poder:"bendicion_apolo"
},


{
emoji:"⚡",
nombre:"Rayo de Zeus",
rareza:"Zeus",
precio:1000000,
stock:1,
poder:"favor_zeus"
},


{
emoji:"⌛",
nombre:"Reloj de Cronos",
rareza:"Cronos",
precio:5000000,
stock:1,
poder:"tiempo_cronos"
}


];



module.exports = objetos;