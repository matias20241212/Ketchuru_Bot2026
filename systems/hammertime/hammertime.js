const { DateTime } = require("luxon");


const timezones = [
  "Pacific/Pago_Pago",        // UTC-11 Samoa Americana
  "Pacific/Honolulu",         // UTC-10 Hawái
  "America/Anchorage",        // UTC-9 Alaska
  "America/Los_Angeles",      // UTC-8 Pacífico
  "America/Denver",            // UTC-7 Montaña
  "America/Mexico_City",       // UTC-6 México
  "America/New_York",          // UTC-5 Este
  "America/Santiago",          // UTC-4 Chile
  "America/Argentina/Buenos_Aires", // UTC-3 Argentina
  "Atlantic/Azores",           // UTC-1 Azores
  "Europe/London",             // UTC+0 Reino Unido
  "Europe/Madrid",             // UTC+1 España
  "Europe/Athens",             // UTC+2
  "Europe/Istanbul",            // UTC+3
  "Asia/Tehran",               // UTC+3:30
  "Asia/Dubai",                // UTC+4
  "Asia/Kabul",                // UTC+4:30
  "Asia/Karachi",              // UTC+5
  "Asia/Kolkata",              // UTC+5:30
  "Asia/Kathmandu",            // UTC+5:45
  "Asia/Dhaka",                // UTC+6
  "Asia/Yangon",               // UTC+6:30
  "Asia/Bangkok",              // UTC+7
  "Asia/Shanghai",             // UTC+8
  "Australia/Eucla",            // UTC+8:45
  "Asia/Tokyo",                // UTC+9
  "Australia/Adelaide",        // UTC+9:30
  "Australia/Sydney",          // UTC+10
  "Australia/Lord_Howe",       // UTC+10:30
  "Pacific/Guadalcanal",       // UTC+11
  "Pacific/Auckland",          // UTC+12
  "Pacific/Chatham",           // UTC+12:45
  "Pacific/Tongatapu",         // UTC+13
  "Pacific/Kiritimati"         // UTC+14
];


// Calcula próximo HAMMER TIME
function getNextHammerTime() {

  const now = DateTime.now().setZone("America/Santiago");

  const day = now.weekday;
  let horarios = [];


  // Lunes a jueves
  if (day >= 1 && day <= 4) {
    horarios = [20];
  }


  // Viernes
  if (day === 5) {

    const semana = Math.ceil(now.day / 7);
    const viernesEspecial = semana % 2 === 0;

    horarios = viernesEspecial
      ? [0, 4, 8, 12, 16, 20]
      : [8, 20];

  }


  // Sábado
  if (day === 6) {
    horarios = [2, 8, 14, 20];
  }


  // Domingo
  if (day === 7) {
    horarios = [8, 20];
  }


  for (const hora of horarios) {

    const siguiente = now.set({
      hour: hora,
      minute: 0,
      second: 0,
      millisecond: 0
    });


    if (siguiente > now) {
      return siguiente;
    }

  }


  return now.plus({ days: 1 }).set({
    hour: 20,
    minute: 0,
    second: 0,
    millisecond: 0
  });

}



// Convierte HAMMER TIME a zonas reales
function convertHammerTime(date) {

  return timezones.map(zone => ({
    zona: zone,
    hora: date
      .setZone(zone)
      .toFormat("dd/MM/yyyy HH:mm")
  }));

}



// Convierte HAMMER TIME a UTC-12 hasta UTC+14
function getUTCList(date) {

  const zones = [];


  for (let offset = -12; offset <= 14; offset++) {

    const name = offset === 0
      ? "UTC±00"
      : offset > 0
        ? `UTC+${offset}`
        : `UTC${offset}`;


    const time = date
      .setZone("UTC")
      .plus({ hours: offset })
      .toFormat("HH:mm");


    zones.push({
      zone: name,
      time
    });

  }


  return zones;

}



// Exporta todo
module.exports = {
  getNextHammerTime,
  convertHammerTime,
  getUTCList
};