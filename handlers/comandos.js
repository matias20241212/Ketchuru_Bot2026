const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.commands = new Map();

    const cargarComandos = (carpeta) => {

        const archivos = fs.readdirSync(carpeta);

        for (const archivo of archivos) {

            const ruta = path.join(carpeta, archivo);
            const stat = fs.statSync(ruta);

            if (stat.isDirectory()) {
                cargarComandos(ruta);
                continue;
            }

            if (!archivo.endsWith(".js")) continue;

            const comando = require(ruta);

            const nombre = comando.nombre || comando.name;
            const ejecutar = comando.ejecutar || comando.execute;

            if (!nombre || !ejecutar) {
                console.log(`⚠️ ${archivo} no tiene formato correcto`);
                continue;
            }

            client.commands.set(nombre, comando);

            console.log(`✅ Comando cargado: ${nombre}`);
        }
    };

    cargarComandos(path.join(__dirname, "../commands"));
};