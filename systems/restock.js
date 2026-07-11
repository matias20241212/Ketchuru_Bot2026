const { formatShop, restockShop } = require("./shop");
const { DateTime } = require("luxon");


const ZONA_CHILE = "America/Santiago";


// Genera los próximos HAMMER TIMES
function getNextHammerTimes() {

    const ahora = DateTime.now().setZone(ZONA_CHILE);

    let horarios = [];


    // Revisar próximos 7 días
    for (let i = 0; i <= 7; i++) {

        const dia = ahora.plus({ days: i });

        const diaSemana = dia.weekday; 
        // 1=Lunes ... 7=Domingo


        let horas = [];


        // Lunes - Jueves
        if (diaSemana >= 1 && diaSemana <= 4) {
            horas = [20];
        }


        // Viernes
        if (diaSemana === 5) {
            horas = [8, 20];
        }


        // Sábado
        if (diaSemana === 6) {
            horas = [2, 8, 14, 20];
        }


        // Domingo
        if (diaSemana === 7) {
            horas = [8, 20];
        }



        for (const hora of horas) {

            let fecha = dia.set({
                hour: hora,
                minute: 0,
                second: 0,
                millisecond: 0
            });


            // No mostrar horarios pasados
            if (fecha > ahora) {

                horarios.push(
                    `<t:${Math.floor(fecha.toSeconds())}:t>`
                );

            }
        }

    }


    return horarios.slice(0, 8);
}




async function restock(client) {


    restockShop();


    const channel = client.channels.cache.get(
        "1523399225071894659"
    );


    if (!channel) return;



    const hammerTimes = getNextHammerTimes()
        .map((hora, index) =>
            `${index + 1}. ${hora}`
        )
        .join("\n");



    channel.send(
        `<@&1523402217556672672>\n\n` +

        `🛒 **KETCHURU SHOP SE HA RESTOCKEADO!**\n\n` +

        formatShop() +

        `\n\n💡 Usa !buy <emoji>\n\n` +

        `⚒️ **HAMMER TIME GLOBAL**\n` +

        `🌍 Próximos horarios:\n` +

        hammerTimes
    );
}



module.exports = {
    restock,
    getNextHammerTimes
};