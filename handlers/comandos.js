const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.commands = new Map();
    client.slashCommands = new Map();

    const cargarComandos = (carpeta) => {

        if (!fs.existsSync(carpeta)) {
            console.warn(`⚠️ Carpeta no encontrada: ${carpeta}`);
            return;
        }

        const archivos = fs.readdirSync(carpeta);

        for (const archivo of archivos) {

            const ruta = path.join(carpeta, archivo);
            const stat = fs.statSync(ruta);

            if (stat.isDirectory()) {
                cargarComandos(ruta);
                continue;
            }

            if (!archivo.endsWith(".js")) {
                continue;
            }

            try {

                const comando = require(ruta);

                const nombre =
                    comando.nombre ||
                    comando.name;

                const ejecutar =
                    comando.ejecutar ||
                    comando.execute;

                if (
                    !nombre ||
                    typeof ejecutar !== "function"
                ) {
                    console.log(
                        `⚠️ ${archivo} no tiene formato de comando válido`
                    );
                    continue;
                }

                // =============================================
                // 🔵 SLASH ONLY
                // =============================================

                if (comando.slashOnly === true) {

                    if (comando.data) {

                        const slashName =
                            comando.data.name ||
                            nombre;

                        client.slashCommands.set(
                            slashName.toLowerCase(),
                            comando
                        );

                        console.log(
                            `🔵 Slash Command cargado: /${slashName}`
                        );

                    } else {

                        console.log(
                            `⚠️ ${archivo} tiene slashOnly=true pero no tiene data`
                        );

                    }

                    continue;
                }

                // =============================================
                // 🟢 COMANDO !
                // =============================================

                client.commands.set(
                    nombre.toLowerCase(),
                    comando
                );

                console.log(
                    `✅ Comando ! cargado: !${nombre}`
                );

                // =============================================
                // 🔵 COMANDO /
                // =============================================

                if (comando.data) {

                    const slashName =
                        comando.data.name ||
                        nombre;

                    client.slashCommands.set(
                        slashName.toLowerCase(),
                        comando
                    );

                    console.log(
                        `🔵 Slash Command cargado: /${slashName}`
                    );
                }

            } catch (error) {

                console.error(
                    `❌ Error cargando comando ${ruta}:`,
                    error
                );

            }

        }

    };

    cargarComandos(
        path.join(
            __dirname,
            "../commands"
        )
    );

    console.log(
        `📦 Comandos !: ${client.commands.size}`
    );

    console.log(
        `🔵 Slash Commands: ${client.slashCommands.size}`
    );

};