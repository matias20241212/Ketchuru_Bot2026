// 🎁 SISTEMA DE RECOMPENSAS DE MISIONES


const objetos = [

    // COMMON
    {emoji:"🍎", rarity:"Common"},
    {emoji:"🍏", rarity:"Common"},
    {emoji:"🍇", rarity:"Common"},
    {emoji:"🍉", rarity:"Common"},
    {emoji:"🍓", rarity:"Common"},


    // UNCOMMON
    {emoji:"🍒", rarity:"Uncommon"},
    {emoji:"🍍", rarity:"Uncommon"},
    {emoji:"🥝", rarity:"Uncommon"},
    {emoji:"🍑", rarity:"Uncommon"},


    // RARE
    {emoji:"🍊", rarity:"Rare"},
    {emoji:"🥑", rarity:"Rare"},
    {emoji:"🔮", rarity:"Rare"},


    // EPIC
    {emoji:"🔥", rarity:"Epic"},
    {emoji:"⚡", rarity:"Epic"},
    {emoji:"🌈", rarity:"Epic"},


    // LEGENDARY
    {emoji:"🍔", rarity:"Legendary"},
    {emoji:"🚀", rarity:"Legendary"},
    {emoji:"🐉", rarity:"Legendary"},


    // MYTHIC
    {emoji:"🍰", rarity:"Mythic"},
    {emoji:"🌠", rarity:"Mythic"},
    {emoji:"🔱", rarity:"Mythic"},


    // SECRET BAD
    {emoji:"💀", rarity:"Secret Bad"},
    {emoji:"👻", rarity:"Secret Bad"},


    // SECRET MEDIUM
    {emoji:"🌪️", rarity:"Secret Medium"},
    {emoji:"🧊", rarity:"Secret Medium"},
    {emoji:"🌑", rarity:"Secret Medium"},
    {emoji:"🌫️", rarity:"Secret Medium"},
    {emoji:"🪐", rarity:"Secret Medium"},
    {emoji:"🌘", rarity:"Secret Medium"},
    {emoji:"🧬", rarity:"Secret Medium"},
    {emoji:"🛸", rarity:"Secret Medium"},
    {emoji:"🌋", rarity:"Secret Medium"},
    {emoji:"🌀", rarity:"Secret Medium"}

];





function recompensaRandom(){


    const tipo =
    Math.random();



    // 🪙 70% monedas
    if(tipo < 0.70){


        return {

            type:"coins",

            amount:
            Math.floor(
                Math.random()*1500
            )+100

        };


    }



    // 🎟️ 20% cupones
    if(tipo < 0.90){


        return {

            type:"coupon",

            discount:
            Math.floor(
                Math.random()*21
            )+10

        };


    }




    // 🎁 10% objeto


    const objeto =
    objetos[
        Math.floor(
            Math.random()*objetos.length
        )
    ];



    return {


        type:"item",

        emoji:objeto.emoji,

        rarity:objeto.rarity


    };

}




module.exports = {

    recompensaRandom

};