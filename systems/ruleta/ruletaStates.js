const activeGames = new Map();

const players = new Map();



module.exports = {


    // Partidas activas

    create(userId, data) {

        activeGames.set(
            userId,
            data
        );

    },


    get(userId) {

        return activeGames.get(userId);

    },


    delete(userId) {

        activeGames.delete(userId);

    },


    has(userId) {

        return activeGames.has(userId);

    },


    clear() {

        activeGames.clear();

    },



    // Estadísticas para top ruleta


    getPlayer(userId){


        if(!players.has(userId)){


            players.set(
                userId,
                {

                    wins:0,

                    losses:0,

                    games:0,

                    money:0

                }
            );


        }


        return players.get(userId);

    },


    players

};