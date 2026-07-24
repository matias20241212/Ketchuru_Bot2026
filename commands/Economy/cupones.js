const db = require("../../database");


module.exports = {

    name:"cupones",


    async execute(message){


        const userId =
        message.author.id;



        const result =
        await db.query(
`
SELECT discount

FROM user_coupons

WHERE discord_id=$1

ORDER BY id
`,
[
userId
]
        );





        if(result.rows.length===0){


            return message.reply(
`
🎟️ **Tus cupones**

❌ No tienes cupones disponibles.

Completa misiones para conseguirlos.
`
            );

        }






        let texto =
`
🎟️ **TUS CUPONES DISPONIBLES**

`;





        result.rows.forEach((c,i)=>{


            texto +=
`
${i+1}️⃣ 🎟️ Cupón descuento

💸 -${c.discount}%

`;

        });






        texto +=
`
🛒 Para usar uno:

\`!buy emoji coupon\`

Ejemplo:

\`!buy 🍎 coupon\`
`;





        message.reply(texto);



    }

};