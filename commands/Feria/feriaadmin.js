const stock =
require("../../systems/feria/feriaStock");


const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
}
=
require("discord.js");


const CANAL_FERIA =
"1535073298470281297";



let confirmaciones = new Map();



module.exports={


nombre:"createferia",



async ejecutar(message,args,db){



if(!message.member.permissions.has(
"Administrator"
))
return message.reply(
"❌ Sin permisos."
);



if(message.content.startsWith("!createferia")){


const botones =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"confirmar_createferia"
)
.setLabel("✅ Crear Feria")
.setStyle(
ButtonStyle.Success
),


new ButtonBuilder()
.setCustomId(
"cancelar_createferia"
)
.setLabel("❌ Cancelar")
.setStyle(
ButtonStyle.Danger
)

);



return message.reply({

content:
`
🎪 **Nueva Feria**

⚠️ Ya existe una Feria activa.

¿Estás seguro de crear una nueva?

La Feria actual será reemplazada completamente.

`,
components:[
botones
]

});


}



}




};