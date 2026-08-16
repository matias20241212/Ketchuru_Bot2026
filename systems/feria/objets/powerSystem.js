const poderes = {


"cupón_atenea":{

nombre:"Cupón de Atenea",

efecto:
"12% descuento en Feria durante 24 horas",

tipo:"descuento",

valor:12,

duracion:86400000

},



"bendicion_apolo":{

nombre:"Bendición de Apolo",

efecto:
"+10% probabilidad de objetos raros",

tipo:"suerte",

valor:10,

duracion:86400000

},



"ira_ares":{

nombre:"Ira de Ares",

efecto:
"+15% recompensa en apuestas",

tipo:"apuesta",

valor:15,

duracion:3600000

},



"favor_zeus":{

nombre:"Favor de Zeus",

efecto:
"+5% posibilidad de Cronos",

tipo:"rareza",

valor:5,

duracion:86400000

},



"tiempo_cronos":{

nombre:"Tiempo de Cronos",

efecto:
"Reduce 50% tiempo de espera",

tipo:"tiempo",

valor:50,

duracion:3600000

}


};



function obtenerPoder(id){

    return poderes[id];

}



module.exports={
    poderes,
    obtenerPoder
};