const { formatShop, restockShop } = require("./shop");
const { DateTime } = require("luxon");


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


async function restock(client) {
  restockShop();

  const channel = client.channels.cache.get("1523399225071894659");
  if (!channel) return;

  const nextHammer = DateTime.now();

  const utcList = getUTCList(nextHammer);

  const utcMessage = utcList
    .map(zone => `${zone.zone}: ${zone.time}`)
    .join("\n");


  channel.send(
    `<@&1523402217556672672>\n\n` +
    `🛒 **KETCHURU SHOP SE HA RESTOCKEADO!**\n\n` +
    formatShop() +
    `\n\n💡 Usa !buy <emoji>\n\n` +
    `⚒️ **HAMMER TIME GLOBAL**\n` +
    `🌍 Próximos horarios:\n` +
    utcMessage
  );
}


module.exports = { restock, getUTCList };