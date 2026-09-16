const { EmbedBuilder } = require("discord.js");
const db = require("../../database");

// =====================================================
// 🏆 TOP TRAGAMONEDAS EN TIEMPO REAL
// =====================================================

let rankingActivo = false;
let mensajeRanking = null;
let ultimoRanking = "";


// =====================================================
// 📊 OBTENER RANKING DESDE NEON
// =====================================================

async function obtenerRanking() {

    const result = await db.query(`
        SELECT
            t.discord_id,
            u.balance,
            t.partidas
        FROM tragamonedas_stats t
        INNER JOIN users u
            ON u.discord_id = t.discord_id
        ORDER BY u.balance DESC
        LIMIT 10
    `);

    return result.rows;
}


// =====================================================
// 🏆 CREAR EMBED
// =====================================================

function crearEmbed(rows) {

    let texto = "";
    let puesto = 1;

    for (const user of rows) {

        const balance = Number(user.balance || 0);
        const partidas = Number(user.partidas || 0);

        let medalla;

        if (puesto === 1) {

            medalla = "🥇";

        } else if (puesto === 2) {

            medalla = "🥈";

        } else if (puesto === 3) {

            medalla = "🥉";

        } else {

            medalla = `**${puesto}.**`;

        }

        texto += `
${medalla} 👤 <@${user.discord_id}>
💰 **${balance.toLocaleString("es-CL")}** monedas
🎰 ${partidas.toLocaleString("es-CL")} partidas

`;

        puesto++;
    }

    return new EmbedBuilder()
        .setTitle("🏆 Top Tragamonedas")
        .setDescription(
            texto ||
            "🎰 Todavía nadie ha jugado tragamonedas."
        )
        .setFooter({
            text: "🎰 Ranking en tiempo real • Neon Database"
        })
        .setTimestamp();
}


// =====================================================
// 🔑 GUARDAR MENSAJE EN NEON
// =====================================================

async function guardarConfiguracion(
    guildId,
    channelId,
    messageId
) {

    await db.query(`
        INSERT INTO top_tragamonedas_config (
            guild_id,
            channel_id,
            message_id
        )
        VALUES ($1, $2, $3)

        ON CONFLICT (guild_id)
        DO UPDATE SET
            channel_id = EXCLUDED.channel_id,
            message_id = EXCLUDED.message_id
    `, [
        guildId,
        channelId,
        messageId
    ]);

}


// =====================================================
// 🔍 OBTENER CONFIGURACIÓN DESDE NEON
// =====================================================

async function obtenerConfiguracion(guildId) {

    const result = await db.query(`
        SELECT
            guild_id,
            channel_id,
            message_id
        FROM top_tragamonedas_config
        WHERE guild_id = $1
        LIMIT 1
    `, [
        guildId
    ]);

    if (
        result.rows.length === 0
    ) {

        return null;

    }

    return result.rows[0];
}


// =====================================================
// 🔄 ACTUALIZADOR CADA 1 SEGUNDO
// =====================================================

async function iniciarActualizador() {

    if (rankingActivo) {

        return;

    }

    rankingActivo = true;

    console.log(
        "🏆 Top Tragamonedas: actualizador iniciado."
    );

    while (rankingActivo) {

        try {

            if (!mensajeRanking) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            1000
                        )
                );

                continue;

            }

            const rows =
                await obtenerRanking();

            const nuevoRanking =
                JSON.stringify(
                    rows.map(
                        user => ({
                            discord_id:
                                user.discord_id,

                            balance:
                                user.balance,

                            partidas:
                                user.partidas
                        })
                    )
                );

            // =================================================
            // 🔄 SOLO EDITAR SI CAMBIÓ EL RANKING
            // =================================================

            if (
                nuevoRanking !==
                ultimoRanking
            ) {

                ultimoRanking =
                    nuevoRanking;

                const embed =
                    crearEmbed(rows);

                try {

                    await mensajeRanking.edit({
                        embeds: [
                            embed
                        ]
                    });

                    console.log(
                        "🔄 Top Tragamonedas actualizado."
                    );

                } catch (editError) {

                    // =========================================
                    // 🗑️ MENSAJE ELIMINADO / NO DISPONIBLE
                    // =========================================

                    if (
                        editError.code === 10008
                    ) {

                        console.warn(
                            "⚠️ El mensaje del Top Tragamonedas ya no existe."
                        );

                        mensajeRanking =
                            null;

                        rankingActivo =
                            false;

                        console.warn(
                            "⚠️ Ejecuta !toptragamonedas para crear uno nuevo."
                        );

                    } else {

                        throw editError;

                    }

                }

            }

        } catch (error) {

            console.error(
                "❌ Error actualizando Top Tragamonedas:",
                error
            );

        }

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1000
                )
        );

    }

}


// =====================================================
// 🔥 RECUPERAR RANKING DESPUÉS DE REINICIO
// =====================================================

async function recuperarRanking(client) {

    try {

        console.log(
            "🔎 Buscando Top Tragamonedas guardado en Neon..."
        );

        const guilds =
            client.guilds.cache;

        for (
            const guild of guilds.values()
        ) {

            const config =
                await obtenerConfiguracion(
                    guild.id
                );

            if (
                !config
            ) {

                continue;

            }

            console.log(
                `🏆 Configuración encontrada para ${guild.name}`
            );

            const channel =
                await client.channels
                    .fetch(
                        config.channel_id
                    )
                    .catch(
                        () => null
                    );

            if (
                !channel
            ) {

                console.warn(
                    "⚠️ No se pudo encontrar el canal del Top Tragamonedas."
                );

                continue;

            }

            const mensaje =
                await channel.messages
                    .fetch(
                        config.message_id
                    )
                    .catch(
                        () => null
                    );

            if (
                !mensaje
            ) {

                console.warn(
                    "⚠️ No se pudo encontrar el mensaje del Top Tragamonedas."
                );

                continue;

            }

            mensajeRanking =
                mensaje;

            const rows =
                await obtenerRanking();

            ultimoRanking =
                JSON.stringify(
                    rows.map(
                        user => ({
                            discord_id:
                                user.discord_id,

                            balance:
                                user.balance,

                            partidas:
                                user.partidas
                        })
                    )
                );

            console.log(
                "✅ Top Tragamonedas recuperado correctamente."
            );

            iniciarActualizador();

            return;

        }

        console.log(
            "ℹ️ No existe todavía un Top Tragamonedas guardado."
        );

    } catch (error) {

        console.error(
            "❌ Error recuperando Top Tragamonedas:",
            error
        );

    }

}


// =====================================================
// 🎰 COMANDO
// =====================================================

module.exports = {

    name: "toptragamonedas",

    // ================================================
    // COMANDO !TOPTRAGAMONEDAS
    // ================================================

    async execute(message) {

        try {

            // ============================================
            // 🔒 EVITAR DUPLICADOS
            // ============================================

            if (
                mensajeRanking
            ) {

                return message.reply(
                    "🏆 El **Top Tragamonedas** ya está activo y se actualiza automáticamente cada segundo."
                );

            }

            // ============================================
            // 📊 OBTENER DATOS
            // ============================================

            const rows =
                await obtenerRanking();

            // ============================================
            // 🏆 CREAR EMBED
            // ============================================

            const embed =
                crearEmbed(rows);

            // ============================================
            // 📩 CREAR MENSAJE
            // ============================================

            const msg =
                await message.reply({
                    embeds: [
                        embed
                    ]
                });

            // ============================================
            // 💾 GUARDAR REFERENCIA EN MEMORIA
            // ============================================

            mensajeRanking =
                msg;

            // ============================================
            // 💾 GUARDAR REFERENCIA EN NEON
            // ============================================

            await guardarConfiguracion(
                message.guild.id,
                message.channel.id,
                msg.id
            );

            console.log(
                "💾 Top Tragamonedas guardado en Neon."
            );

            // ============================================
            // 📌 GUARDAR ESTADO INICIAL
            // ============================================

            ultimoRanking =
                JSON.stringify(
                    rows.map(
                        user => ({
                            discord_id:
                                user.discord_id,

                            balance:
                                user.balance,

                            partidas:
                                user.partidas
                        })
                    )
                );

            // ============================================
            // 🔄 INICIAR ACTUALIZADOR
            // ============================================

            iniciarActualizador();

            console.log(
                "🏆 Top Tragamonedas activo."
            );

        } catch (error) {

            console.error(
                "❌ Error en !toptragamonedas:",
                error
            );

            return message.reply(
                "❌ Ocurrió un error al cargar el Top Tragamonedas."
            );

        }

    },

    // ================================================
    // 🔥 FUNCIÓN PARA INDEX.JS
    // ================================================

    recuperarRanking

};