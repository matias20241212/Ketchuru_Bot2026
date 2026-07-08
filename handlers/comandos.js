const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.comandos = new Map();


    const carpeta = path.join(__dirname, "../comandos");


    const archivos = fs.readdirSync(carpeta)
        .filter(archivo => archivo.endsWith(".js"));


    for (const archivo of archivos) {

        const comando = require(
            path.join(carpeta, archivo)
        );


        if (!comando.nombre || !comando.ejecutar) {
            console.log(`⚠️ ${archivo} no tiene formato correcto`);
            continue;
        }


        client.comandos.set(
            comando.nombre,
            comando
        );


        console.log(`✅ Comando cargado: ${comando.nombre}`);

    }

};