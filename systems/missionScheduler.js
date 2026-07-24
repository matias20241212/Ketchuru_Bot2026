const { DateTime } = require("luxon");
const { generarMisionesGlobales } = require("./missionGenerator");


function iniciarMissionScheduler(client){


    setInterval(async () => {


        const ahora = DateTime.now()
            .setZone("America/Santiago");


        const dia = ahora.weekday; // 1 lunes - 7 domingo
        const hora = ahora.hour;
        const minutos = ahora.minute;



        // Horarios de activación
        const horarios = [

            // Lunes a jueves 16:00
            {dias:[1,2,3,4], hora:16},


            // Viernes y domingo
            {dias:[5,7], hora:4},
            {dias:[5,7], hora:16},


            // Sábado
            {dias:[6], hora:4},
            {dias:[6], hora:12},
            {dias:[6], hora:16},
            {dias:[6], hora:0}

        ];



        const activar = horarios.some(h =>
            h.dias.includes(dia) &&
            h.hora === hora &&
            minutos === 0
        );



        if(!activar) return;



        console.log("🎯 Evento de misiones activado");


        try {


            await generarMisionesGlobales();


            console.log("✅ Misiones generadas correctamente");


        } catch(error){


            console.error(
                "❌ Error generando misiones:",
                error
            );


        }


    },60000);


}



module.exports = {
    iniciarMissionScheduler
};