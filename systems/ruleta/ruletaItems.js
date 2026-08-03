const items = [

    {
        id: "coin_small",
        name: "Monedas pequeñas",
        emoji: "🪙",
        rarity: "common",
        reward: 500
    },

    {
        id: "coin_medium",
        name: "Bolsa de monedas",
        emoji: "💰",
        rarity: "rare",
        reward: 5000
    },

    {
        id: "coin_big",
        name: "Tesoro Ketchuru",
        emoji: "🏆",
        rarity: "legendary",
        reward: 50000
    },

    {
        id: "diamond",
        name: "Diamante",
        emoji: "💎",
        rarity: "secret",
        reward: 250000
    }

];


function getRandomItem(){

    const random = Math.random();

    if(random < 0.55){
        return items[0];
    }

    if(random < 0.85){
        return items[1];
    }

    if(random < 0.98){
        return items[2];
    }

    return items[3];

}


module.exports = {
    items,
    getRandomItem
};