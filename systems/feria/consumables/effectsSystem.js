async function aplicarEfecto(
usuario,
efecto,
db
){



const termina =
Date.now()
+
efecto.duracion;



await db.query(
`
INSERT INTO user_effects
(
discord_id,
effect,
value,
expires
)

VALUES
($1,$2,$3,$4)

`,
[
usuario,
efecto.efecto,
efecto.valor,
termina
]

);



}



async function obtenerEfecto(
usuario,
tipo,
db
){



const resultado =
await db.query(
`
SELECT *

FROM user_effects

WHERE discord_id=$1

AND effect=$2

AND expires>$3

`,
[
usuario,
tipo,
Date.now()
]

);



return resultado.rows[0] || null;


}



module.exports={

aplicarEfecto,

obtenerEfecto

};