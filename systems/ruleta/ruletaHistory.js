const history = new Map();

const CONFIG = require("./ruletaConfig");


function add(userId, data){

    if(!history.has(userId)){
        history.set(userId, []);
    }


    const list = history.get(userId);


    list.unshift({
        ...data,
        date: Date.now()
    });


    if(list.length > CONFIG.historyLimit){
        list.pop();
    }


    history.set(userId, list);

}



function get(userId){

    return history.get(userId) || [];

}



function clear(userId){

    history.delete(userId);

}



module.exports = {
    add,
    get,
    clear
};