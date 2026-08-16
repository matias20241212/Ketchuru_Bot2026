const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}
=
require("discord.js");



function crearBotones(objeto,index){


const botones =
new ActionRowBuilder()
.addComponents(


new ButtonBuilder()

.setCustomId(
`feria_comprar_${index}`
)

.setLabel(
"🛒 Comprar"
)

.setStyle(
ButtonStyle.Success
),



new ButtonBuilder()

.setCustomId(
`feria_poder_${index}`
)

.setLabel(
"✨ Ver poder"
)

.setStyle(
ButtonStyle.Primary
),



new ButtonBuilder()

.setCustomId(
`feria_cancelar_${index}`
)

.setLabel(
"❌ Cerrar"
)

.setStyle(
ButtonStyle.Danger
)


);



return botones;

}



module.exports={
crearBotones
};