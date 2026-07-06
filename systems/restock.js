const { formatShop, restockShop } = require("./shop");

async function restock(client) {
  restockShop();

  const channel = client.channels.cache.get("1523399225071894659");
  if (!channel) return;

  channel.send(
    `🛒 KETCHURU SHOP SE HA RESTOCKEADO!\n\n` +
    formatShop() +
    `\n\n💡 Usa !buy <emoji>\n⏰ Próximo restock en horas Hammer Time`
  );
}

module.exports = { restock };