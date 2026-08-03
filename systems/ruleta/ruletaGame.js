const config = require("./ruletaConfig");
const items = require("./ruletaItems");
const states = require("./ruletaStates");
const rouletteDB = require("./ruletaDatabase");



function play(){

    const random = Math.random();

    let result;


    if(random < 0.48){

        result = "rojo";

    } 
    else if(random < 0.96){

        result = "negro";

    }
    else{

        result = "verde";

    }



    return {

        color: result,

        emoji: config.colors[result],

        multiplier: config.winMultiplier[result],

        item: items.getRandomItem()

    };

}





async function calculateReward(
    userId,
    bet,
    result,
    choice
){

    const player = states.getPlayer(userId);



    player.games++;



    // PERDIÓ

    if(result.color !== choice){


        player.losses++;



        await rouletteDB.addLoss({

            userId,

            bet,

            color: result.color,

            choice

        });



        return {

            win:false,

            reward:0

        };

    }




    // GANÓ


    const reward =
    bet * result.multiplier;



    player.wins++;

    player.money += reward;




    await rouletteDB.addWin({

        userId,

        bet,

        reward,

        color:result.color,

        choice

    });





    return {

        win:true,

        reward

    };

}





module.exports = {

    play,

    calculateReward

};