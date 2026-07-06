const { formatShop } = require("../../systems/shop");

module.exports = {
  name: "shop",

  execute(message) {
    const text = formatShop();

    return message.channel.send(text + `\n\n💡 Usa: !buy <emoji>`);
  }
};