module.exports = {

    nombre: "Closeactive",


    async ejecutar(message){


        const canal = message.channel;


        if(
            !canal.name.startsWith("🎫・historial")
        ){

            return message.reply(
                "🚫 No puedes usar eso AQUÍ.\n\n🔒 Este comando solo funciona dentro de tu historial."
            );

        }



        const permiso = canal.permissionsFor(
            message.author
        );


        if(!permiso.has("ViewChannel")){

            return message.reply(
                "❌ Este historial no te pertenece."
            );

        }



        await message.reply(
            "🔒 Cerrando historial..."
        );


        setTimeout(()=>{

            canal.delete()
            .catch(console.error);

        },3000);



    }

};