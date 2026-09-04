const config = require("./ruletaConfig");
const items = require("./ruletaItems");
const states = require("./ruletaStates");
const rouletteDB = require("./ruletaDatabase");



function play() {

    const random = Math.random();

    let result;

    if (random < 0.48) {

        result = "rojo";

    } else if (random < 0.96) {

        result = "negro";

    } else {

        result = "verde";

    }

    return {

        color: result,

        emoji: config.colors[result],

        multiplier: config.winMultiplier[result],

        item: items.getRandomItem()

    };

}



/**
 * Calcula el resultado de una partida.
 *
 * IMPORTANTE:
 * Esta función es async porque guarda el resultado
 * en la base de datos mediante rouletteDB.
 */
async function calculateReward(
    userId,
    bet,
    result,
    choice
) {

    // Obtener el estado del jugador
    const player = states.getPlayer(userId);

    // Si por alguna razón no existe el estado,
    // evitamos que el bot se caiga.
    if (!player) {

        console.error(
            `❌ No existe estado de ruleta para ${userId}`
        );

        return {

            win: false,

            reward: 0,

            error: true

        };

    }



    // Registrar partida
    player.games++;



    // ==================================================
    // PERDIÓ
    // ==================================================

    if (result.color !== choice) {

        player.losses++;



        try {

            await rouletteDB.addLoss({

                userId,

                bet,

                color: result.color,

                choice

            });

        } catch (error) {

            console.error(
                "❌ Error guardando derrota de ruleta:",
                error
            );

        }



        return {

            win: false,

            reward: 0

        };

    }



    // ==================================================
    // GANÓ
    // ==================================================

    const reward =
        Math.floor(
            bet * result.multiplier
        );



    player.wins++;

    player.money += reward;



    try {

        await rouletteDB.addWin({

            userId,

            bet,

            reward,

            color: result.color,

            choice

        });

    } catch (error) {

        console.error(
            "❌ Error guardando victoria de ruleta:",
            error
        );

    }



    return {

        win: true,

        reward

    };

}



module.exports = {

    play,

    calculateReward

};