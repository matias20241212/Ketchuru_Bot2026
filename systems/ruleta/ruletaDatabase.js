const db = require("../../database");



async function addWin(data){

    await db.query(
`
INSERT INTO roulette_stats
(
discord_id,
games,
wins,
losses,
coins_won,
coins_lost,
best_win
)

VALUES
($1,1,1,0,$2,0,$2)

ON CONFLICT(discord_id)

DO UPDATE SET

games = roulette_stats.games + 1,

wins = roulette_stats.wins + 1,

coins_won = roulette_stats.coins_won + $2,

best_win =
GREATEST(
roulette_stats.best_win,
$2
)

`,
[
data.userId,
data.reward
]

);


}




async function addLoss(data){

    await db.query(
`
INSERT INTO roulette_stats
(
discord_id,
games,
wins,
losses,
coins_won,
coins_lost,
best_win
)

VALUES
($1,1,0,1,0,$2,0)


ON CONFLICT(discord_id)

DO UPDATE SET


games = roulette_stats.games + 1,


losses = roulette_stats.losses + 1,


coins_lost =
roulette_stats.coins_lost + $2

`,
[
data.userId,
data.bet
]

);


}




module.exports = {

addWin,

addLoss

};