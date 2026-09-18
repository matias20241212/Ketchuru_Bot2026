const fs = require("fs");
const path = require("path");

const comandos = [
    "multiplier.js",
    "restockevent.js",
    "tragamonedasmultiplier.js",
    "Tragamonedas.js",
    "Balance.js",
    "buy.js",
    "cupones.js",
    "daily.js",
    "inventory.js",
    "misiones.js",
    "publicinventory.js",
    "ruleta.js",
    "Shop.js",
    "statstragamonedas.js",
    "topruleta.js",
    "toptragamonedas.js",
    "mensajes.js",
    "profile.js",
    "restock.js",
    "stock.js"
];

const commandsPath = path.join(__dirname, "commands");

function buscarArchivo(carpeta, nombreBuscado) {

    if (!fs.existsSync(carpeta)) {
        return null;
    }

    for (const archivo of fs.readdirSync(carpeta)) {

        const ruta = path.join(carpeta, archivo);
        const stat = fs.statSync(ruta);

        if (stat.isDirectory()) {

            if (archivo === "_slash") {
                continue;
            }

            const encontrado =
                buscarArchivo(ruta, nombreBuscado);

            if (encontrado) {
                return encontrado;
            }

        } else if (
            archivo.toLowerCase() ===
            nombreBuscado.toLowerCase()
        ) {

            return ruta;

        }

    }

    return null;
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔎 DIAGNÓSTICO DE COMANDOS SLASH");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");

for (const archivo of comandos) {

    const ruta =
        buscarArchivo(
            commandsPath,
            archivo
        );

    console.log("");
    console.log(`📄 ${archivo}`);

    if (!ruta) {
        console.log("   ❌ Archivo no encontrado");
        continue;
    }

    const contenido =
        fs.readFileSync(
            ruta,
            "utf8"
        );

    const nombreMatch =
        contenido.match(
            /(?:nombre|name)\s*:\s*["'`]([^"'`]+)["'`]/
        );

    const nombre =
        nombreMatch
            ? nombreMatch[1]
            : "NO DETECTADO";

    const tieneEjecutar =
        /\b(?:async\s+)?ejecutar\s*\(/.test(
            contenido
        );

    const tieneExecute =
        /\b(?:async\s+)?execute\s*\(/.test(
            contenido
        );

    const tieneModuleExports =
        /module\.exports\s*=/.test(
            contenido
        );

    const argumentos =
        [
            ...contenido.matchAll(
                /args\[(\d+)\]/g
            )
        ]
            .map(
                match => Number(match[1])
            );

    const maxArg =
        argumentos.length
            ? Math.max(...argumentos)
            : -1;

    console.log(
        `   📁 Ruta: ${path.relative(
            __dirname,
            ruta
        )}`
    );

    console.log(
        `   🏷️ Nombre: ${nombre}`
    );

    console.log(
        `   🟢 ejecutar(): ${
            tieneEjecutar
                ? "SÍ"
                : "NO"
        }`
    );

    console.log(
        `   🔵 execute(): ${
            tieneExecute
                ? "SÍ"
                : "NO"
        }`
    );

    console.log(
        `   📦 module.exports: ${
            tieneModuleExports
                ? "SÍ"
                : "NO"
        }`
    );

    console.log(
        `   🔧 Máximo args[]: ${
            maxArg >= 0
                ? maxArg
                : "ninguno"
        }`
    );

}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ DIAGNÓSTICO TERMINADO");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");