const fs = require("fs");
const { generateShop } = require("./shopSystem");

const CHANNEL_ID = "1523399225071894659";

async function restock(client) {
  const channel = await client.channels.fetch(CHANNEL_ID);

  const shop = generateShop();

  fs.writeFileSync("./data/shop.json", JSON.stringify({
    lastRestock: Date.now(),
    items: shop
  }, null, 2));

  let text = "";

  shop.forEach(i => {
    text += `**${i.rarity}** ${i.emoji} ${i.price}\n`;
  });

  await channel.send(
`🛒 Ketchuru Shop se ha restockeado y estas son las habilidades que están con stock ahora:

${text}

📦 Compra con: !buy (emoji)

⏳ Hammer Time 20:00 Chile`
  );
}

module.exports = { restock };