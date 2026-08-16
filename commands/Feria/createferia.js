const feriaStock = require("../../systems/feria/feriaStock");

const CANAL_FERIA = "1535073298470281297";

// ============================================================
// 🎪 CREATE FERIA
//
// Formato:
//
// !createferia Sabado 12Pm - 8Am -6Utc
//
// El UTC es obligatorio.
// Puede ser:
// -12Utc
// -6Utc
// -4Utc
// +0Utc
// +1Utc
// +12Utc
// ============================================================


// ============================================================
// 📅 DÍAS
// ============================================================

const DIAS = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6
};


// ============================================================
// 🕐 CONVERTIR HORA
// ============================================================

function convertirHora(texto) {

    texto = texto
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("hrs", "")
        .replace("hora", "");

    const match = texto.match(
        /^(\d{1,2})(?::(\d{2}))?(am|pm)$/
    );

    if (!match) {
        return null;
    }

    let hora = Number(match[1]);

    const minutos = Number(
        match[2] || 0
    );

    const periodo = match[3];

    if (
        hora < 1 ||
        hora > 12 ||
        minutos < 0 ||
        minutos > 59
    ) {
        return null;
    }

    if (periodo === "am") {

        if (hora === 12) {
            hora = 0;
        }

    } else {

        if (hora !== 12) {
            hora += 12;
        }

    }

    return {
        hora,
        minutos
    };
}


// ============================================================
// 🌎 CONVERTIR UTC
// ============================================================

function convertirUTC(texto) {

    const limpio = texto
        .toLowerCase()
        .replace(/\s+/g, "");

    const match = limpio.match(
        /^([+-]?\d{1,2})utc$/
    );

    if (!match) {
        return null;
    }

    const utc = Number(
        match[1]
    );

    if (
        utc < -12 ||
        utc > 14
    ) {
        return null;
    }

    return utc;
}


// ============================================================
// 🕐 FORMATEAR HORA
// ============================================================

function formatearHora(hora, minutos) {

    const periodo =
        hora >= 12
            ? "PM"
            : "AM";

    let hora12 =
        hora % 12;

    if (hora12 === 0) {
        hora12 = 12;
    }

    const minutosTexto =
        String(minutos)
            .padStart(2, "0");

    return `${hora12}:${minutosTexto} ${periodo}`;
}


// ============================================================
// 🌎 FORMATEAR UTC
// ============================================================

function formatearUTC(utc) {

    if (utc === 0) {
        return "UTC";
    }

    return utc > 0
        ? `UTC+${utc}`
        : `UTC${utc}`;
}


// ============================================================
// 📅 CALCULAR FECHA DE INICIO
// ============================================================

function obtenerProximoDia(
    diaNumero,
    hora,
    minutos
) {

    const ahora = new Date();

    const fecha = new Date();

    fecha.setUTCDate(
        ahora.getUTCDate()
    );

    fecha.setUTCMonth(
        ahora.getUTCMonth()
    );

    fecha.setUTCFullYear(
        ahora.getUTCFullYear()
    );

    fecha.setUTCHours(
        hora,
        minutos,
        0,
        0
    );

    let diferencia =
        diaNumero -
        fecha.getUTCDay();

    if (diferencia < 0) {
        diferencia += 7;
    }

    fecha.setUTCDate(
        fecha.getUTCDate() +
        diferencia
    );

    // Si es hoy pero la hora ya pasó,
    // lo mandamos a la próxima semana.
    if (
        diferencia === 0 &&
        fecha.getTime() <= ahora.getTime()
    ) {

        fecha.setUTCDate(
            fecha.getUTCDate() + 7
        );

    }

    return fecha;
}


// ============================================================
// 🎪 EJECUTAR
// ============================================================

async function ejecutar(message, args) {

    try {

        // ----------------------------------------------------
        // FORMATO
        // ----------------------------------------------------

        if (args.length < 4) {

            return message.reply(
                [
                    "❌ **Formato incorrecto.**",
                    "",
                    "Usa:",
                    "`!createferia Dia HoraInicio - HoraFin Utc`",
                    "",
                    "Ejemplo:",
                    "`!createferia Sabado 12Pm - 8Am -6Utc`",
                    "",
                    "El UTC es obligatorio.",
                    "Ejemplos válidos: `-4Utc`, `-6Utc`, `+1Utc`, `+0Utc`"
                ].join("\n")
            );

        }


        // ----------------------------------------------------
        // DÍA
        // ----------------------------------------------------

        const diaTexto =
            args[0]
                .toLowerCase();

        const diaNumero =
            DIAS[diaTexto];

        if (
            diaNumero === undefined
        ) {

            return message.reply(
                "❌ Día inválido. Usa lunes, martes, miércoles, jueves, viernes, sábado o domingo."
            );

        }


        // ----------------------------------------------------
        // HORAS
        // ----------------------------------------------------

        const horaInicioTexto =
            args[1];

        const separador =
            args[2];

        const horaFinTexto =
            args[3];

        if (
            separador !== "-"
        ) {

            return message.reply(
                "❌ Debes separar las horas con `-`."
            );

        }


        const horaInicio =
            convertirHora(
                horaInicioTexto
            );

        const horaFin =
            convertirHora(
                horaFinTexto
            );

        if (
            !horaInicio ||
            !horaFin
        ) {

            return message.reply(
                [
                    "❌ Hora inválida.",
                    "",
                    "Ejemplo correcto:",
                    "`12Pm - 8Am`"
                ].join("\n")
            );

        }


        // ----------------------------------------------------
        // UTC
        // ----------------------------------------------------

        const utcTexto =
            args[4];

        const utc =
            convertirUTC(
                utcTexto
            );

        if (
            utc === null
        ) {

            return message.reply(
                [
                    "❌ UTC inválido.",
                    "",
                    "Debes escribirlo así:",
                    "`-4Utc`",
                    "`-6Utc`",
                    "`+1Utc`",
                    "`+0Utc`",
                    "",
                    "El UTC es obligatorio."
                ].join("\n")
            );

        }


        // ----------------------------------------------------
        // 🎪 GENERAR STOCK
        // ----------------------------------------------------

        if (
            !feriaStock ||
            typeof feriaStock.generarStock !==
            "function"
        ) {

            console.error(
                "❌ feriaStock:",
                feriaStock
            );

            return message.reply(
                "❌ El sistema de stock de Feria no está configurado correctamente."
            );

        }


        feriaStock.generarStock();


        // ----------------------------------------------------
        // 📅 CALCULAR INICIO
        // ----------------------------------------------------

        const fechaInicio =
            obtenerProximoDia(
                diaNumero,
                horaInicio.hora,
                horaInicio.minutos
            );


        // ----------------------------------------------------
        // ⏱️ CALCULAR DURACIÓN
        // ----------------------------------------------------

        let inicioMinutos =
            horaInicio.hora * 60 +
            horaInicio.minutos;

        let finMinutos =
            horaFin.hora * 60 +
            horaFin.minutos;

        let duracionMinutos =
            finMinutos -
            inicioMinutos;

        // Si la hora final es menor,
        // significa que termina al día siguiente.
        if (
            duracionMinutos <= 0
        ) {

            duracionMinutos +=
                24 * 60;

        }


        // ----------------------------------------------------
        // 🔚 FECHA DE CIERRE
        // ----------------------------------------------------

        const fechaFin =
            new Date(
                fechaInicio.getTime()
            );

        fechaFin.setUTCMinutes(
            fechaFin.getUTCMinutes() +
            duracionMinutos
        );


        // ----------------------------------------------------
        // 📝 TEXTO
        // ----------------------------------------------------

        const diaNombre =
            diaTexto
                .charAt(0)
                .toUpperCase() +
            diaTexto.slice(1);


        const horaInicioTextoFinal =
            formatearHora(
                horaInicio.hora,
                horaInicio.minutos
            );


        const horaFinTextoFinal =
            formatearHora(
                horaFin.hora,
                horaFin.minutos
            );


        const utcFinal =
            formatearUTC(
                utc
            );


        // ----------------------------------------------------
        // 🎪 MENSAJE
        // ----------------------------------------------------

        const mensaje =
            [
                "🎪 **NUEVA FERIA CREADA**",
                "",
                `🗓️ Día: **${diaNombre}**`,
                `🕐 Horario: **${horaInicioTextoFinal} - ${horaFinTextoFinal}**`,
                `🌎 Zona horaria: **${utcFinal}**`,
                "",
                "🛒 **Nuevo stock generado.**",
                "",
                "⏰ **Esta Feria cierra en Hammer Time**",
                `🔨 Cierre: **${horaFinTextoFinal} ${utcFinal}**`,
                "",
                "🎟️ ¡La nueva Feria ya está disponible!"
            ].join("\n");


        // ----------------------------------------------------
        // 📢 ENVIAR AL CANAL
        // ----------------------------------------------------

        const canal =
            await message.client.channels
                .fetch(
                    CANAL_FERIA
                )
                .catch(
                    error => {

                        console.error(
                            "❌ Error obteniendo canal de Feria:",
                            error
                        );

                        return null;

                    }
                );


        if (canal) {

            await canal.send(
                mensaje
            );

        }


        // ----------------------------------------------------
        // ✅ RESPUESTA AL ADMIN
        // ----------------------------------------------------

        return message.reply(
            [
                "✅ **Feria creada correctamente.**",
                "",
                `🗓️ ${diaNombre}`,
                `🕐 ${horaInicioTextoFinal} - ${horaFinTextoFinal}`,
                `🌎 ${utcFinal}`,
                "",
                `🔨 **Hammer Time:** ${horaFinTextoFinal} ${utcFinal}`
            ].join("\n")
        );


    } catch (error) {

        console.error(
            "❌ ERROR EN !createferia:",
            error
        );

        return message.reply(
            "❌ Ocurrió un error al crear la Feria."
        ).catch(
            console.error
        );

    }

}


// ============================================================
// 📦 EXPORT
// ============================================================

module.exports = {

    nombre: "createferia",
    ejecutar

};