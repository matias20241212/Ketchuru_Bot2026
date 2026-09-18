const db = require("../database");

const {
    getRandomEasyWord
} = require("../systems/wordle/wordleWord");

// ============================================================
// 🛡️ ROLES PERMITIDOS
// ============================================================

const ROLES_PERMITIDOS = [
    "1465524197085155420",
    "1512618062917144708",
    "1495243561883533342",
    "1516897210862931978",
    "1516896452889153646",
    "1512179364194947343",
    "1497041324631658586"
];

// ============================================================
// 🕛 PRÓXIMO MEDIODÍA DE CHILE
// ============================================================

function obtenerProximoMediodia() {

    const ahora = new Date();

    const partes = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "America/Santiago",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(ahora);

    const year = Number(
        partes.find(p => p.type === "year").value
    );

    const month = Number(
        partes.find(p => p.type === "month").value
    );

    const day = Number(
        partes.find(p => p.type === "day").value
    );

    const horaPartes = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "America/Santiago",
            hour: "numeric",
            minute: "numeric",
            hour12: false
        }
    ).formatToParts(ahora);

    const hora = Number(
        horaPartes.find(p => p.type === "hour").value
    );

    const minuto = Number(
        horaPartes.find(p => p.type === "minute").value
    );

    // Chile puede estar en UTC-3 o UTC-4.
    // Creamos la fecha usando los componentes de Chile
    // y luego buscamos el siguiente mediodía.

    let fechaBase = new Date(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00`
    );

    // Ajuste aproximado para trabajar con la fecha local de Chile.
    // Lo importante es que Discord reciba correctamente el timestamp.

    if (
        hora > 12 ||
        (hora === 12 && minuto >= 0)
    ) {
        fechaBase.setDate(
            fechaBase.getDate() + 1
        );
    }

    return fechaBase;
}

// ============================================================
// ⏱️ CALCULAR EXPIRACIÓN
// ============================================================

function calcularExpiracion(duracion) {

    if (!duracion) {
        return obtenerProximoMediodia();
    }

    const duracionNormalizada =
        duracion
            .toLowerCase()
            .trim();

    // "all" = hasta el próximo mediodía
    if (duracionNormalizada === "all") {
        return obtenerProximoMediodia();
    }

    // Aceptar 1h hasta 12h
    const match =
        duracionNormalizada.match(
            /^([1-9]|1[0-2])h$/
        );

    if (!match) {
        return null;
    }

    const horas =
        Number(match[1]);

    return new Date(
        Date.now() +
        horas * 60 * 60 * 1000
    );
}

// ============================================================
// 🛡️ COMPROBAR PERMISOS
// ============================================================

function tienePermiso(member) {

    if (!member) {
        return false;
    }

    return member.roles.cache.some(
        role =>
            ROLES_PERMITIDOS.includes(role.id)
    );
}

// ============================================================
// 🟨 EJECUTAR CREATEWORDLE
// ============================================================

async function ejecutar(message, args) {

    // --------------------------------------------------------
    // 🌐 SOLO SERVIDORES
    // --------------------------------------------------------

    if (!message.guild) {

        return message.reply(
            "❌ Este comando solo puede utilizarse dentro de un servidor."
        );

    }

    // --------------------------------------------------------
    // 🛡️ PERMISOS
    // --------------------------------------------------------

    if (!tienePermiso(message.member)) {

        return message.reply(
            "❌ No tienes permiso para crear Wordles."
        );

    }

    // --------------------------------------------------------
    // 📖 ARGUMENTOS
    // --------------------------------------------------------

    if (args.length < 2) {

        return message.reply(
            "❌ **Uso correcto:**\n\n" +
            "`!createwordle daily all`\n" +
            "`!createwordle daily Nombre all`\n" +
            "`!createwordle daily Nombre 7h`\n\n" +
            "⏱️ Duración: `all` o entre `1h` y `12h`."
        );

    }

    // --------------------------------------------------------
    // 🟨 TIPO
    // --------------------------------------------------------

    const tipo =
        args[0].toLowerCase();

    if (tipo !== "daily") {

        return message.reply(
            "❌ Actualmente solo puedes crear Wordles de tipo `daily`."
        );

    }

    // --------------------------------------------------------
    // 📝 NOMBRE + DURACIÓN
    // --------------------------------------------------------

    let nombre;
    let duracion;

    if (args.length === 2) {

        nombre = "Daily";
        duracion = args[1];

    } else {

        nombre =
            args
                .slice(1, -1)
                .join(" ")
                .trim();

        duracion =
            args[args.length - 1];

    }

    // --------------------------------------------------------
    // 🚫 NOMBRE VACÍO
    // --------------------------------------------------------

    if (!nombre) {
        nombre = "Daily";
    }

    // --------------------------------------------------------
    // ⏱️ EXPIRACIÓN
    // --------------------------------------------------------

    const expiraEn =
        calcularExpiracion(duracion);

    if (!expiraEn) {

        return message.reply(
            "❌ **Duración inválida.**\n\n" +
            "Usa `all` o entre `1h` y `12h`."
        );

    }

    // --------------------------------------------------------
    // 🎲 OBTENER PALABRA
    // --------------------------------------------------------

    let palabra;

    try {

        palabra =
            getRandomEasyWord();

    } catch (error) {

        console.error(
            "❌ Error obteniendo palabra Wordle:",
            error
        );

        return message.reply(
            "❌ No se pudo obtener una palabra para el Wordle."
        );

    }

    if (!palabra) {

        return message.reply(
            "❌ No se encontró ninguna palabra disponible."
        );

    }

    // ========================================================
    // 🗃️ BASE DE DATOS
    // ========================================================

    try {

        // ----------------------------------------------------
        // CREAR TABLA SI NO EXISTE
        // ----------------------------------------------------

        await db.query(`
            CREATE TABLE IF NOT EXISTS wordle_creados (
                id SERIAL PRIMARY KEY,
                nombre TEXT NOT NULL,
                tipo TEXT NOT NULL DEFAULT 'daily',
                palabra TEXT NOT NULL,
                creado_por TEXT NOT NULL,
                creado_en TIMESTAMP DEFAULT NOW(),
                expira_en TIMESTAMP NOT NULL,
                activo BOOLEAN DEFAULT true
            )
        `);

        // ----------------------------------------------------
        // 🔴 DESACTIVAR WORDLE ANTERIOR DEL MISMO NOMBRE
        // ----------------------------------------------------

        await db.query(
            `
            UPDATE wordle_creados
            SET activo = false
            WHERE nombre = $1
              AND activo = true
            `,
            [nombre]
        );

        // ----------------------------------------------------
        // 🟢 CREAR NUEVO WORDLE
        // ----------------------------------------------------

        const result =
            await db.query(
                `
                INSERT INTO wordle_creados
                (
                    nombre,
                    tipo,
                    palabra,
                    creado_por,
                    expira_en,
                    activo
                )
                VALUES
                (
                    $1,
                    'daily',
                    $2,
                    $3,
                    $4,
                    true
                )
                RETURNING *
                `,
                [
                    nombre,
                    palabra,
                    message.author.id,
                    expiraEn
                ]
            );

        const wordle =
            result.rows[0];

        // ----------------------------------------------------
        // ⏰ TIMESTAMP DISCORD
        // ----------------------------------------------------

        const timestamp =
            Math.floor(
                expiraEn.getTime() / 1000
            );

        // ----------------------------------------------------
        // 🟨 RESPUESTA
        // ----------------------------------------------------

        return message.reply(
            `🟨 **WORDLE DAILY CREADO**\n\n` +
            `📛 Nombre: **${wordle.nombre}**\n` +
            `🆔 ID: \`${wordle.id}\`\n` +
            `🧩 Dificultad: **Fácil**\n` +
            `🔤 Letras: **3-5**\n` +
            `⏰ Termina: <t:${timestamp}:F>\n` +
            `⏳ Tiempo restante: <t:${timestamp}:R>\n\n` +
            `🎁 Recompensa: **10.000 monedas**\n` +
            `👤 Creado por: ${message.author}`
        );

    } catch (error) {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ ERROR CREANDO WORDLE"
        );

        console.error(error);

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        return message.reply(
            "❌ Ocurrió un error creando el Wordle.\n" +
            "Revisa la consola para ver los detalles."
        );

    }

}

// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {
    name: "createwordle",
    ejecutar
};