const rarezas = {

    Hermes:{
        probabilidad:35
    },

    Atenea:{
        probabilidad:25
    },

    Ares:{
        probabilidad:15
    },

    Apolo:{
        probabilidad:10
    },

    Poseidon:{
        probabilidad:7
    },

    Hades:{
        probabilidad:4
    },

    Hefesto:{
        probabilidad:2
    },

    Artemisa:{
        probabilidad:1.5
    },

    Zeus:{
        probabilidad:0.4
    },

    Cronos:{
        probabilidad:0.1
    }

};



function obtenerRareza(){


    const random =
    Math.random()*100;


    let acumulado=0;



    for(const rareza in rarezas){


        acumulado +=
        rarezas[rareza].probabilidad;



        if(random <= acumulado){

            return rareza;

        }

    }


    return "Hermes";

}



module.exports={
    rarezas,
    obtenerRareza
};