async function buscarCodigo(db,codigo){


const resultado =
await db.query(
`
SELECT *
FROM redeem_codes
WHERE code=$1
AND active=true
`,
[codigo]
);



return resultado.rows[0];

}





async function yaUsoCodigo(db,usuario,codigo){


const resultado =
await db.query(
`
SELECT *
FROM redeem_history
WHERE discord_id=$1
AND code=$2
`,
[
usuario,
codigo
]
);



return resultado.rows.length > 0;

}





async function canjearCodigo(db,usuario,codigo){


const datos =
await buscarCodigo(db,codigo);



if(!datos){
return {
ok:false,
mensaje:"Código inválido."
};
}



const usado =
await yaUsoCodigo(
db,
usuario,
codigo
);



if(usado){

return {
ok:false,
mensaje:"Ya usaste este código."
};

}



await db.query(
`
INSERT INTO redeem_history
(
discord_id,
code,
reward
)

VALUES
($1,$2,$3)
`,
[
usuario,
codigo,
datos.reward
]
);



await db.query(
`
UPDATE users

SET balance = balance + $1

WHERE discord_id=$2
`,
[
datos.reward,
usuario
]
);



return {

ok:true,

reward:datos.reward

};


}



module.exports={
buscarCodigo,
yaUsoCodigo,
canjearCodigo
};