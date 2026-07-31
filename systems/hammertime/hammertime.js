// =========================
// 🔨 PRÓXIMO SHOP HAMMER TIME
// =========================

function getNextShopTime(){

    const now = DateTime.now()
    .setZone("America/Santiago");


    const dia = now.weekday;

    let horarios = [];


    // Lunes a jueves
    if(dia >= 1 && dia <= 4){
        horarios = [20];
    }


    // Viernes
    if(dia === 5){

        const semana = Math.ceil(now.day / 7);
        const especial = semana % 2 === 0;


        horarios = especial
        ? [0,4,8,12,16,20]
        : [8,20];

    }


    // Sábado
    if(dia === 6){
        horarios = [2,8,14,20];
    }


    // Domingo
    if(dia === 7){
        horarios = [8,20];
    }



    for(const hora of horarios){

        const fecha = now.set({
            hour: hora,
            minute:0,
            second:0,
            millisecond:0
        });


        if(fecha > now){
            return fecha;
        }

    }


    return now.plus({days:1})
    .set({
        hour:20,
        minute:0,
        second:0,
        millisecond:0
    });

}



// =========================
// 🎯 PRÓXIMA MISIÓN
// =========================

function getNextMissionTime(){


    const now = DateTime.now()
    .setZone("America/Santiago");


    const dia = now.weekday;


    let horarios = [];



    // Lunes - Jueves
    if(dia >=1 && dia <=4){
        horarios = [16];
    }



    // Viernes
    if(dia ===5){
        horarios = [4,16];
    }



    // Sábado
    if(dia ===6){
        horarios = [0,4,12,16];
    }



    // Domingo
    if(dia===7){
        horarios=[4,16];
    }




    for(const hora of horarios){


        const fecha = now.set({

            hour:hora,
            minute:0,
            second:0,
            millisecond:0

        });


        if(fecha > now){
            return fecha;
        }


    }



    return now.plus({days:1})
    .set({

        hour:16,
        minute:0,
        second:0,
        millisecond:0

    });


}



// =========================
// 🌎 DISCORD GLOBAL TIME
// =========================

function discordTime(date){

    return `<t:${Math.floor(date.toSeconds())}:t>`;

}



module.exports = {

    getNextShopTime,
    getNextMissionTime,
    discordTime

};