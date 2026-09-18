const fs = require("fs");
const path = require("path");

const commandsPath = path.join(__dirname, "commands");

let total = 0;
let conSlash = [];
let sinSlash = [];
let invalidos = [];

const EXCLUIDOS = [
    "Meme.js",
    "Work.js",
    "apuestas.js",
    "consumir.js",
    "Help.js",
    "wordledaily.js"
];

function analizarCarpeta(carpeta) {
    if (!fs.existsSync(carpeta)) return;

    const archivos = fs.readdirSync(carpeta);

    for (const archivo of archivos) {
        const ruta = path.join(carpeta, archivo);
        const stat = fs.statSync(ruta);

        if (stat.isDirectory()) {
            analizarCarpeta(ruta);
            continue;
        }

        if (!archivo.endsWith(".js")) continue;

        // Estos archivos quedan fuera del sistema automático
        if (EXCLUIDOS.includes(archivo)) {
            continue;
        }

        total++;

        try {
            delete require.cache[require.resolve(ruta)];

            const comando = require(ruta);

            const nombre =
                comando.nombre ||
                comando.name ||
                archivo.replace(".js", "").toLowerCase();

            /*
             * Todo comando que tenga ejecutar() o execute()
             * ya funciona como comando tradicional.
             *
             * Por lo tanto:
             *
             * !comando
             *
             * sigue existiendo.
             */

            const ejecutar =
                comando.ejecutar ||
                comando.execute;

            if (!nombre || typeof ejecutar !== "function") {
                invalidos.push(
                    `${archivo} → no tiene nombre o ejecutar/execute()`
                );
                continue;
            }

            /*
             * Si tiene data, significa que ya posee
             * definición de Slash Command.
             */

            if (
                comando.data &&
                typeof comando.data.toJSON === "function"
            ) {
                conSlash.push({
                    archivo,
                    nombre
                });
            } else {
                sinSlash.push({
                    archivo,
                    nombre
                });
            }

        } catch (error) {
            invalidos.push(
                `${archivo} → ${error.message}`
            );
        }
    }
}

analizarCarpeta(commandsPath);

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔎 ANÁLISIS DE SLASH COMMANDS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");

console.log(`📦 Comandos analizados: ${total}`);
console.log(`🟢 Ya tienen ! + /: ${conSlash.length}`);
console.log(`🟡 Tienen ! pero falta /: ${sinSlash.length}`);
console.log(`🔴 Con problemas: ${invalidos.length}`);

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🟢 YA TIENEN ! + /");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (conSlash.length) {
    for (const comando of conSlash) {
        console.log(
            `   !${comando.nombre}  +  /${comando.nombre}`
        );
    }
} else {
    console.log("   Ninguno");
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🟡 NECESITAN SLASH");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (sinSlash.length) {
    for (const comando of sinSlash) {
        console.log(
            `   !${comando.nombre}  → falta /${comando.nombre}`
        );
    }
} else {
    console.log("   Ninguno");
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔴 CON PROBLEMAS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (invalidos.length) {
    for (const problema of invalidos) {
        console.log(`   ${problema}`);
    }
} else {
    console.log("   Ninguno");
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📌 OBJETIVO");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("");
console.log("Todos los comandos deberán quedar así:");
console.log("");
console.log("   !comando");
console.log("   /comando");
console.log("");
console.log("Los comandos ! existentes NO serán eliminados.");
console.log("");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ ANÁLISIS TERMINADO");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");