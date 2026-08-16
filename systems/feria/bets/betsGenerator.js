const apuestas = [

{
id:"carrera",
nombre:"🏃 Carrera de Ketchurus",
probabilidad:40,
premio:50000,
tipo:"monedas"
},


{
id:"cofre",
nombre:"📦 Cofre Misterioso",
probabilidad:20,
premio:"objeto",
tipo:"objeto"
},


{
id:"ruleta",
nombre:"🎡 Ruleta de la Feria",
probabilidad:30,
premio:100000,
tipo:"monedas"
},


{
id:"dioses",
nombre:"⚡ Desafío de Dioses",
probabilidad:10,
premio:"apolo",
tipo:"objeto"
},


{
id:"suerte",
nombre:"🍀 Prueba de Suerte",
probabilidad:50,
premio:25000,
tipo:"monedas"
},


{
id:"arena",
nombre:"⚔️ Arena Ketchuru",
probabilidad:25,
premio:75000,
tipo:"monedas"
}


];



function generarApuestas(){


return apuestas

.sort(() =>
Math.random()-0.5
)

.slice(0,5);


}



module.exports={
generarApuestas,
apuestas
};