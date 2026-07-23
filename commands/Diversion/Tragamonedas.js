const db = require("../../database");
const fs = require("fs");

const tragamonedasMultiplierFile =
"./data/tragamonedasMultiplier.json";



function loadTragamonedasMultiplier(){

    if(!fs.existsSync(tragamonedasMultiplierFile))
        return 1;


    const data =
    JSON.parse(
        fs.readFileSync(tragamonedasMultiplierFile)
    );


    return data.level || 1;

}



function sleep(ms){

    return new Promise(
        resolve => setTimeout(resolve,ms)
    );

}




// 🎰 Probabilidades
const emojis = [

{
emoji:"❤️",
chance:30
},

{
emoji:"🦈",
chance:22
},

{
emoji:"🍀",
chance:18
},

{
emoji:"🍒",
chance:12
},

{
emoji:"🔥",
chance:8
},

{
emoji:"🍇",
chance:6
},

{
emoji:"🍍",
chance:3
},

{
emoji:"💎",
chance:1
}

];




function randomEmoji(){


    const total =
    emojis.reduce(
        (a,b)=>a+b.chance,
        0
    );


    let random =
    Math.random()*total;



    for(const item of emojis){


        random -= item.chance;


        if(random <= 0){

            return item.emoji;

        }

    }


    return "❤️";

}




module.exports = {


name:"tragamonedas",



async execute(message,args){



const userId =
message.author.id;



let result =
await db.query(
`
SELECT balance
FROM users
WHERE discord_id=$1
`,
[userId]
);





if(result.rows.length===0){


await db.query(
`
INSERT INTO users
(discord_id,balance)

VALUES
($1,$2)
`,
[userId,50]
);



result =
await db.query(
`
SELECT balance
FROM users
WHERE discord_id=$1
`,
[userId]
);


}




let balance =
Number(result.rows[0].balance);






const apuestas =
[
10,
50,
100,
500,
1000,
2500,
5000,
10000,
50000
];



const bet =
parseInt(args[0]);



if(!apuestas.includes(bet)){


return message.reply(
"❌ Apuesta inválida."
);


}



if(balance < bet){


return message.reply(
"❌ No tienes suficientes monedas."
);


}





let msg =
await message.reply(
"🎰 Girando tragamonedas..."
);







for(let i=0;i<5;i++){


const fake=[

[
randomEmoji(),
randomEmoji(),
randomEmoji()
],

[
randomEmoji(),
randomEmoji(),
randomEmoji()
],

[
randomEmoji(),
randomEmoji(),
randomEmoji()
]

];



await msg.edit(

`🎰 SLOT 3x3\n\n`+

`${fake[0].join(" | ")}\n`+

`${fake[1].join(" | ")}\n`+

`${fake[2].join(" | ")}`

);



await sleep(350);


}







const grid=[

[
randomEmoji(),
randomEmoji(),
randomEmoji()
],

[
randomEmoji(),
randomEmoji(),
randomEmoji()
],

[
randomEmoji(),
randomEmoji(),
randomEmoji()
]

];






const count={};



for(const e of grid.flat()){


count[e]=
(count[e]||0)+1;


}






let topEmoji =
Object.keys(count)
.reduce(
(a,b)=>
count[a]>count[b]
?a:b
);




let veces =
count[topEmoji];




let multiplier = 0;





// 💎 DIAMANTE
if(topEmoji==="💎"){


const diamond = {


3:5,

4:8,

5:15,

6:25,

7:40,

8:75,

9:150


};


multiplier =
diamond[veces] || 0;



}




// 🎰 NORMAL
else {



const normal = {


3:1.2,

4:1.8,

5:3,

6:5,

7:8,

8:15,

9:30


};



multiplier =
normal[veces] || 0;



}







const bonus =
loadTragamonedasMultiplier();




let ganancia;



if(multiplier===0){


ganancia =
-bet;


}else{


ganancia =
Math.floor(
bet *
multiplier *
bonus
);


}





balance += ganancia;



if(balance<0)
balance=0;







await db.query(

`
UPDATE users

SET balance=$1

WHERE discord_id=$2
`,
[
balance,
userId
]

);







// 📊 Estadísticas

await db.query(

`
INSERT INTO tragamonedas_stats
(
discord_id,
partidas,
victorias
)

VALUES
($1,1,$2)


ON CONFLICT(discord_id)

DO UPDATE SET

partidas =
tragamonedas_stats.partidas + 1,


victorias =
tragamonedas_stats.victorias + $2
`,
[
userId,
multiplier>0 ? 1 : 0
]

);








await sleep(500);






await msg.edit(

`🎰 **SLOT 3x3 FINAL**\n\n`+

`${grid[0].join(" | ")}\n`+

`${grid[1].join(" | ")}\n`+

`${grid[2].join(" | ")}\n\n`+


`🏆 Mejor: ${topEmoji} x${veces}\n`+

`🎲 Apuesta: ${bet}\n`+

`⚡ Multiplicador: x${multiplier}\n`+

`🎰 Bonus: x${bonus}\n`+

`💰 Cambio: ${ganancia}\n`+

`💳 Balance: ${balance}`

);



}


};