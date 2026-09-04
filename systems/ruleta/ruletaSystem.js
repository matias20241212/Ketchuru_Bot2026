const {
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const config = require("./ruletaConfig");
const game = require("./ruletaGame");
const cooldown = require("./ruletaCooldown");
const antiAbuse = require("./ruletaAntiAbuse");
const history = require("./ruletaHistory");
const logs = require("./ruletaLogs");
const buttons = require("./ruletaButtons");
const states = require("./ruletaStates");
const canvasRuleta = require("./ruletaCanvas");


// ============================================================
// 🛡️ PROTECCIÓN
// ============================================================

let proteccionRuleta = null;

try {

    const protection =
        require("../../moderation/proteccionRuleta");

    if (
        protection &&
        typeof protection.check === "function"
    ) {

        proteccionRuleta =
            protection.check;

    }

} catch (error) {

    console.error(
        "❌ No se pudo cargar proteccionRuleta:",
        error
    );

}


// ============================================================
// ⏱️ ESPERAR
// ============================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


// ============================================================
// 🎰 INICIAR RULETA
// ============================================================

async function start(
    message,
    bet
) {

    const userId =
        message.author.id;


    // ========================================================
    // 🛡️ ANTI ABUSO
    // ========================================================

    try {

        const abuse =
            antiAbuse.check(
                userId
            );

        if (
            abuse &&
            abuse.blocked
        ) {

            return message.reply(
                "🚫 Demasiados intentos de ruleta."
            );

        }

    } catch (error) {

        console.error(
            "❌ Error anti-abuso:",
            error
        );

        return message.reply(
            "❌ No se pudo iniciar la ruleta."
        );

    }


    // ========================================================
    // 🛡️ PROTECCIÓN
    // ========================================================

    if (
        proteccionRuleta
    ) {

        try {

            const protection =
                proteccionRuleta(
                    userId
                );

            if (
                protection &&
                protection.blocked
            ) {

                return message.reply(
                    "🚫 Demasiados intentos de ruleta."
                );

            }

        } catch (error) {

            console.error(
                "❌ Error protección:",
                error
            );

            return message.reply(
                "❌ No se pudo comprobar la protección."
            );

        }

    }


    // ========================================================
    // ⏳ COOLDOWN
    // ========================================================

    const cd =
        cooldown.checkCooldown(
            userId
        );

    if (
        cd &&
        cd.active
    ) {

        return message.reply(
            `⏳ Espera ${Math.ceil(
                cd.remaining / 1000
            )} segundos.`
        );

    }


    // ========================================================
    // 💰 APUESTA
    // ========================================================

    if (
        !Number.isFinite(bet) ||
        !Number.isInteger(bet)
    ) {

        return message.reply(
            "❌ La apuesta debe ser un número entero."
        );

    }


    if (
        bet < config.minBet ||
        bet > config.maxBet
    ) {

        return message.reply(
            `❌ La apuesta debe ser entre ${config.minBet} y ${config.maxBet} 🪙.`
        );

    }


    // ========================================================
    // 🎮 ESTADO
    // ========================================================

    if (
        states.has(userId)
    ) {

        return message.reply(
            "⚠️ Ya tienes una ruleta en curso."
        );

    }


    states.create(

        userId,

        {

            bet,

            createdAt:
                Date.now()

        }

    );


    cooldown.setCooldown(
        userId
    );


    // ========================================================
    // 🎰 MENSAJE INICIAL
    // ========================================================

    const embed =
        new EmbedBuilder()

            .setTitle(
                "🎰 Ruleta Ketchuru"
            )

            .setDescription(

                `💰 Apuesta: **${bet} 🪙**\n\n` +

                "🎯 **Elige tu color:**\n\n" +

                "🔴 Rojo\n" +
                "⚫ Negro\n" +
                "🟢 Verde"

            )

            .setColor(
                "Gold"
            );


    let msg;


    try {

        msg =
            await message.reply({

                embeds: [
                    embed
                ],

                components: [
                    buttons.createButtons(
                        userId
                    )
                ]

            });

    } catch (error) {

        states.delete(
            userId
        );

        throw error;

    }


    // ========================================================
    // 🎮 COLLECTOR
    // ========================================================

    const collector =
        msg.createMessageComponentCollector({

            time:
                30000

        });


    collector.on(
        "collect",
        async interaction => {

            try {

                // =================================================
                // 👤 USUARIO
                // =================================================

                if (
                    interaction.user.id !== userId
                ) {

                    return interaction.reply({

                        content:
                            "❌ Esta ruleta no es tuya.",

                        ephemeral:
                            true

                    });

                }


                // =================================================
                // 🎨 COLOR
                // =================================================

                const parts =
                    interaction.customId.split(
                        "_"
                    );

                const choice =
                    parts[1];


                if (
                    !config.colors[choice]
                ) {

                    return interaction.reply({

                        content:
                            "❌ Color inválido.",

                        ephemeral:
                            true

                    });

                }


                // =================================================
                // 🛑 DOBLE CLICK
                // =================================================

                if (
                    !states.has(userId)
                ) {

                    return interaction.reply({

                        content:
                            "❌ Esta ruleta ya terminó.",

                        ephemeral:
                            true

                    });

                }


                // =================================================
                // ⚡ RESPONDER
                // =================================================

                await interaction.deferUpdate();


                // =================================================
                // 🔒 BLOQUEAR
                // =================================================

                states.delete(
                    userId
                );

                collector.stop(
                    "completed"
                );


                // =================================================
                // 🎲 RESULTADO
                // =================================================

                const result =
                    game.play();


                console.log(
                    `🎰 RULETA | ${userId} | Apostó: ${choice} | Salió: ${result.color}`
                );


                // =================================================
                // 💰 RECOMPENSA
                // =================================================

                const reward =
                    await game.calculateReward(

                        userId,

                        bet,

                        result,

                        choice

                    );


                // =================================================
                // 🎡 MENSAJE DE GIRO
                // =================================================

                const spinningEmbed =
                    new EmbedBuilder()

                        .setTitle(
                            "🎰 ¡RULETA GIRANDO!"
                        )

                        .setDescription(

                            `🎯 Apostaste a: **${config.colors[choice]}**\n\n` +

                            "🌀 **La ruleta está girando...**\n" +
                            "⏳ Espera a que se detenga."

                        )

                        .setColor(
                            "Gold"
                        );


                await msg.edit({

                    content:
                        null,

                    embeds: [
                        spinningEmbed
                    ],

                    components: []

                });


                // =================================================
                // 🎬 GENERAR GIF
                // =================================================

                console.log(
                    "🎬 Generando GIF de Ruleta..."
                );


                const gif =
                    await canvasRuleta.createRuletaGif(

                        result.color,

                        choice

                    );


                console.log(
                    `🎬 GIF generado: ${gif.length} bytes`
                );


                // =================================================
                // 📎 ADJUNTO
                // =================================================

                const gifAttachment =
                    new AttachmentBuilder(

                        gif,

                        {

                            name:
                                "ruleta.gif"

                        }

                    );


                // =================================================
                // 🎡 MOSTRAR GIF
                // =================================================

                await msg.edit({

                    content:
                        null,

                    embeds: [
                        spinningEmbed
                    ],

                    files: [
                        gifAttachment
                    ],

                    components: []

                });


                // =================================================
                // ⏳ ESPERAR 8 SEGUNDOS
                // =================================================

                await sleep(
                    8000
                );


                // =================================================
                // 🏆 RESULTADO
                // =================================================

                const resultadoTexto =
                    reward.win

                        ? `🎉 **¡GANASTE!**\n\n` +
                          `💰 Ganaste **${reward.reward} 🪙**`

                        : `💀 **¡PERDISTE!**\n\n` +
                          `💸 Perdiste **${bet} 🪙**`;


                const resultadoEmbed =
                    new EmbedBuilder()

                        .setTitle(

                            reward.win
                                ? "🎉 ¡GANASTE!"
                                : "💀 ¡PERDISTE!"

                        )

                        .setDescription(

                            `🎯 **Tu elección:**\n` +
                            `${config.colors[choice]}\n\n` +

                            `🎰 **Salió:**\n` +
                            `${result.emoji}\n\n` +

                            resultadoTexto

                        )

                        .setColor(

                            reward.win
                                ? "Green"
                                : "Red"

                        )

                        .setFooter({

                            text:
                                "🎰 Ruleta Ketchuru"

                        })

                        .setTimestamp();


                // =================================================
                // 🖼️ IMAGEN RESULTADO
                // =================================================

                const finalImage =
                    canvasRuleta.createRuletaImage(

                        0,

                        result.color,

                        choice

                    );


                const finalAttachment =
                    new AttachmentBuilder(

                        finalImage,

                        {

                            name:
                                "ruleta-final.png"

                        }

                    );


                // =================================================
                // 📩 RESULTADO FINAL
                // =================================================

                await msg.edit({

                    content:
                        null,

                    embeds: [
                        resultadoEmbed
                    ],

                    files: [
                        finalAttachment
                    ],

                    components: []

                });


                // =================================================
                // 📜 HISTORIAL
                // =================================================

                try {

                    history.add(

                        userId,

                        {

                            bet,

                            choice,

                            result:
                                result.color,

                            reward:
                                reward.reward

                        }

                    );

                } catch (error) {

                    console.error(
                        "⚠️ Error historial:",
                        error
                    );

                }


                // =================================================
                // 📝 LOG
                // =================================================

                try {

                    await logs.sendLog(

                        message.client,

                        {

                            userId,

                            bet,

                            result:
                                result.color,

                            reward:
                                reward.reward

                        }

                    );

                } catch (error) {

                    console.error(
                        "⚠️ Error log:",
                        error
                    );

                }

            } catch (error) {

                console.error(
                    "❌ ERROR EN RULETA:",
                    error
                );


                states.delete(
                    userId
                );


                try {

                    if (
                        !interaction.replied &&
                        !interaction.deferred
                    ) {

                        await interaction.reply({

                            content:
                                "❌ Ocurrió un error procesando la ruleta.",

                            ephemeral:
                                true

                        });

                    }

                } catch {}

            }

        }
    );


    // ========================================================
    // ⏰ EXPIRACIÓN
    // ========================================================

    collector.on(
        "end",
        async (collected, reason) => {

            if (
                reason === "completed"
            ) {

                return;

            }


            states.delete(
                userId
            );


            if (
                collected.size === 0
            ) {

                try {

                    await msg.edit({

                        embeds: [

                            new EmbedBuilder()

                                .setTitle(
                                    "🎰 Ruleta cancelada"
                                )

                                .setDescription(
                                    "⏰ Se agotó el tiempo para elegir un color."
                                )

                                .setColor(
                                    "Grey"
                                )

                        ],

                        components: []

                    });

                } catch {}

            }

        }
    );

}


// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports = {

    start

};