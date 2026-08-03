const attempts = new Map();


const MAX_ATTEMPTS = 5;
const TIME_WINDOW = 60000; // 1 minuto


function check(userId){

    const now = Date.now();


    if(!attempts.has(userId)){
        attempts.set(userId, []);
    }


    let userAttempts = attempts.get(userId);


    userAttempts = userAttempts.filter(
        time => now - time < TIME_WINDOW
    );


    userAttempts.push(now);


    attempts.set(userId, userAttempts);


    if(userAttempts.length > MAX_ATTEMPTS){

        return {
            blocked:true,
            reason:"Demasiados intentos de ruleta"
        };

    }


    return {
        blocked:false
    };

}



function clear(userId){

    attempts.delete(userId);

}



module.exports = {
    check,
    clear
};