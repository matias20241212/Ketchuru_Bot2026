function obtenerRecompensas(nivel){


return {

bonus:
nivel * 2,


feriaLuck:
Math.floor(nivel / 5),


expLuck:
Math.floor(nivel / 10)


};


}



module.exports={
obtenerRecompensas
};