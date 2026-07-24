const { generarMisionesGlobales } = require("./missionGenerator");


function iniciarMissionScheduler(client){


    setInterval(async () => {

        const ahora = new Date();


        const hora = ahora.getHours();
        const minutos = ahora.getMinutes();



        // 🕓 Activar misiones a las 16:00
        if(hora === 16 && minutos === 0){


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


        }


    },60000);


}



module.exports = {
    iniciarMissionScheduler
};