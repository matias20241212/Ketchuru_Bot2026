const cooldowns = new Map();

const CONFIG = require("./ruletaConfig");


function checkCooldown(userId){

    if(!cooldowns.has(userId)){
        return {
            active:false
        };
    }


    const time = cooldowns.get(userId);

    const remaining = CONFIG.cooldown - (Date.now() - time);


    if(remaining <= 0){

        cooldowns.delete(userId);

        return {
            active:false
        };

    }


    return {
        active:true,
        remaining
    };

}



function setCooldown(userId){

    cooldowns.set(
        userId,
        Date.now()
    );

}



function removeCooldown(userId){

    cooldowns.delete(userId);

}



module.exports = {
    checkCooldown,
    setCooldown,
    removeCooldown
};