const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.commands = new Map();

    const carpeta = path.join(__dirname, "../commands");

    const archivos = fs.readdirSync(carpeta)
        .filter(archivo => archivo.endsWith(".js"));


    for (const archivo of archivos) {

        const comando = require(
            path.join(carpeta, archivo)
        );


        // Acepta formato antiguo y nuevo
        const nombre = comando.nombre || comando.name;
        const ejecutar = comando.ejecutar || comando.execute;


        if (!nombre || !ejecutar) {
            console.log(`⚠️ ${archivo} no tiene formato correcto`);
            continue;
        }


        // Guardar comando completo
        client.commands.set(
            nombre,
            comando
        );


        console.log(`✅ Comando cargado: ${nombre}`);

    }

};