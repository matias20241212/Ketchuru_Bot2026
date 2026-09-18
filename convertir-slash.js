const fs = require("fs");
const path = require("path");

const commandsPath = path.join(__dirname, "commands");
const generatedPath = path.join(
    commandsPath,
    "_slash"
);

const EXCLUIDOS = [
    "Meme.js",
    "Work.js",
    "apuestas.js",
    "consumir.js",
    "Help.js",
    "wordledaily.js"
];

const YA_CONVERTIDOS = [
    "Ping.js",
    "wordle.js",
    "createferia.js"
];

let generados = 0;
let saltados = 0;
let problemas = 0;

function obtenerNombre(contenido, archivo) {

    const match =
        contenido.match(
            /(?:nombre|name)\s*:\s*["'`]([^"'`]+)["'`]/
        );

    return (
        match
            ? match[1]
            : archivo.replace(".js", "")
    ).toLowerCase();
}

function convertirNombreSlash(nombre) {

    return nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32);
}

function obtenerNombreSlash(nombre, archivo) {

    // Tragamonedas debe conservar su nombre real
    if (
        archivo.toLowerCase() ===
        "tragamonedas.js"
    ) {
        return "tragamonedas";
    }

    return convertirNombreSlash(nombre);
}

function detectarArgs(contenido) {

    const encontrados = new Set();

    const regex =
        /\bargs\[(\d+)\]/g;

    let match;

    while (
        (match = regex.exec(contenido)) !== null
    ) {

        encontrados.add(
            Number(match[1])
        );
    }

    return [
        ...encontrados
    ].sort(
        (a, b) => a - b
    );
}

function crearOpciones(maxArg) {

    if (maxArg < 0) {
        return "";
    }

    let opciones = "";

    for (
        let i = 0;
        i <= maxArg;
        i++
    ) {

        opciones += `
        .addStringOption(option =>
            option
                .setName("arg${i + 1}")
                .setDescription("Argumento ${i + 1}")
                .setRequired(${i === 0})
        )`;
    }

    return opciones;
}

function crearAdapter({
    rutaOriginal,
    nombre,
    nombreSlash,
    args,
    usaExecute
}) {

    const rutaRequire =
        path
            .relative(
                generatedPath,
                rutaOriginal
            )
            .replace(/\\/g, "/");

    const maxArg =
        args.length
            ? Math.max(...args)
            : -1;

    const opciones =
        crearOpciones(maxArg);

    let obtenerArgs =
        "const args = [];";

    if (maxArg >= 0) {

        const valores = [];

        for (
            let i = 0;
            i <= maxArg;
            i++
        ) {

            valores.push(
                `interaction.options.getString("arg${i + 1}")`
            );
        }

        obtenerArgs = `
        const args = [
            ${valores.join(",\n            ")}
        ];

        while (
            args.length &&
            (
                args[args.length - 1] === null ||
                args[args.length - 1] === undefined
            )
        ) {
            args.pop();
        }
`;
    }

    const llamada = usaExecute
        ? `
        return comando.execute(
            message,
            args,
            db
        );
`
        : `
        return comando.ejecutar(
            message,
            args,
            db
        );
`;

    return `// ============================================================
// 🤖 ADAPTADOR SLASH AUTOMÁTICO
// ============================================================

const {
    SlashCommandBuilder
} = require("discord.js");

const comando = require(
    ${JSON.stringify(rutaRequire)}
);

module.exports = {

    slashOnly: true,

    nombre: ${JSON.stringify(nombre)},

    data: new SlashCommandBuilder()
        .setName(
            ${JSON.stringify(nombreSlash)}
        )
        .setDescription(
            ${JSON.stringify(`Versión Slash de !${nombre}`)}
        )${opciones},

    async execute(interaction, db) {

${obtenerArgs}

        let respondido = false;

        const responder = async (contenido) => {

            if (
                interaction.replied ||
                interaction.deferred ||
                respondido
            ) {

                return interaction.followUp(
                    contenido
                );

            }

            respondido = true;

            return interaction.reply(
                contenido
            );
        };

        const message = {

            content:
                "!${nombre}" +
                (
                    args.length
                        ? " " + args.join(" ")
                        : ""
                ),

            author:
                interaction.user,

            user:
                interaction.user,

            member:
                interaction.member,

            guild:
                interaction.guild,

            channel:
                interaction.channel,

            client:
                interaction.client,

            mentions:
                interaction.mentions,

            id:
                interaction.id,

            createdTimestamp:
                Date.now(),

            reply:
                responder
        };

${llamada}
    }
};
`;
}

function recorrer(carpeta) {

    if (
        !fs.existsSync(carpeta)
    ) {
        return;
    }

    for (
        const archivo of fs.readdirSync(carpeta)
    ) {

        const ruta =
            path.join(
                carpeta,
                archivo
            );

        const stat =
            fs.statSync(ruta);

        if (stat.isDirectory()) {

            if (
                archivo === "_slash"
            ) {
                continue;
            }

            recorrer(ruta);
            continue;
        }

        if (
            !archivo.endsWith(".js")
        ) {
            continue;
        }

        if (
            EXCLUIDOS.includes(archivo)
        ) {

            console.log(
                `⚪ Excluido: ${archivo}`
            );

            saltados++;
            continue;
        }

        if (
            YA_CONVERTIDOS.includes(archivo)
        ) {

            console.log(
                `🟢 Ya convertido: ${archivo}`
            );

            saltados++;
            continue;
        }

        const contenido =
            fs.readFileSync(
                ruta,
                "utf8"
            );

        const nombre =
            obtenerNombre(
                contenido,
                archivo
            );

        const tieneEjecutar =
            /\b(?:async\s+)?ejecutar\s*\(/.test(
                contenido
            );

        const tieneExecute =
            /\b(?:async\s+)?execute\s*\(/.test(
                contenido
            );

        if (
            !tieneEjecutar &&
            !tieneExecute
        ) {

            console.log(
                `🟡 Omitido: ${archivo} → no tiene ejecutar() ni execute()`
            );

            saltados++;
            continue;
        }

        const nombreSlash =
            obtenerNombreSlash(
                nombre,
                archivo
            );

        if (!nombreSlash) {

            console.log(
                `🔴 Problema: ${archivo} → nombre Slash inválido`
            );

            problemas++;
            continue;
        }

        const args =
            detectarArgs(
                contenido
            );

        const destino =
            path.join(
                generatedPath,
                `${path.basename(
                    archivo,
                    ".js"
                )}.slash.js`
            );

        const adapter =
            crearAdapter({
                rutaOriginal: ruta,
                nombre,
                nombreSlash,
                args,
                usaExecute: tieneExecute
            });

        fs.writeFileSync(
            destino,
            adapter,
            "utf8"
        );

        console.log("");
        console.log(
            `🔵 Adaptador creado: !${nombre} + /${nombreSlash}`
        );

        console.log(
            `   📄 ${path.relative(
                __dirname,
                destino
            )}`
        );

        console.log(
            `   ⚙️ Método: ${
                tieneExecute
                    ? "execute()"
                    : "ejecutar()"
            }`
        );

        console.log(
            `   🔧 Argumentos: ${
                args.length
            }`
        );

        generados++;
    }
}

console.log("");
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.log(
    "🚀 GENERADOR SEGURO DE SLASH COMMANDS"
);
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.log("");

console.log(
    "🛡️ Los comandos originales NO serán modificados."
);

console.log(
    "📁 Adaptadores: commands/_slash/"
);

console.log("");

/*
 * Limpiamos solamente los adaptadores
 * generados anteriormente.
 *
 * NO tocamos commands/ originales.
 */

if (
    fs.existsSync(generatedPath)
) {

    for (
        const archivo of fs.readdirSync(
            generatedPath
        )
    ) {

        const ruta =
            path.join(
                generatedPath,
                archivo
            );

        if (
            fs.statSync(ruta).isFile() &&
            archivo.endsWith(".slash.js")
        ) {

            fs.unlinkSync(ruta);

            console.log(
                `🧹 Adaptador anterior eliminado: ${archivo}`
            );
        }
    }
}

fs.mkdirSync(
    generatedPath,
    {
        recursive: true
    }
);

recorrer(
    commandsPath
);

console.log("");
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.log(
    "📊 RESULTADO"
);
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.log("");

console.log(
    `🔵 Adaptadores creados: ${generados}`
);

console.log(
    `⚪ Saltados: ${saltados}`
);

console.log(
    `🔴 Problemas: ${problemas}`
);

console.log("");
console.log(
    "📁 Ubicación:"
);

console.log(
    "   commands/_slash/"
);

console.log("");
console.log(
    "⚠️ Los Slash todavía NO se registraron."
);

console.log(
    "   Primero hay que revisar el resultado."
);

console.log("");
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.log(
    "🏁 GENERACIÓN TERMINADA"
);
console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);