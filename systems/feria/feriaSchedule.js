const { DateTime } = require("luxon");


const ZONA = "America/Santiago";


const horarios = [
    {
        dia: 2, // Martes
        inicio: 11,
        fin: 18
    },
    {
        dia: 4, // Jueves
        inicio: 10,
        fin: 17
    },
    {
        dia: 6, // Sábado
        inicio: 9,
        fin: 16
    }
];



function feriaActiva(){

    const ahora =
    DateTime.now()
    .setZone(ZONA);


    const dia =
    ahora.weekday;


    const hora =
    ahora.hour;



    const encontrado =
    horarios.find(x =>
        x.dia === dia &&
        hora >= x.inicio &&
        hora < x.fin
    );



    return encontrado ? true : false;

}



function tiempoFeria(){

    const ahora =
    DateTime.now()
    .setZone(ZONA);


    return ahora.toFormat(
        "dd/MM/yyyy HH:mm"
    );

}



module.exports={
    feriaActiva,
    tiempoFeria
};