const stock =
    require("../systems/feria/feriaStock");

const CANAL_FERIA =
    "1535073298470281297";


// ============================================================
// 🎪 HANDLER DE BOTONES DE FERIA
// ============================================================

async function manejarBotones(interaction) {

    // Ignorar cualquier cosa que no sea un botón
    if (!interaction.isButton()) {
        return;
    }


    // ========================================================
    // 🎪 CREAR FERIA
    // ========================================================

    if (
        interaction.customId ===
        "confirmar_createferia"
    ) {

        try {

            // =================================================
            // ⚡ RESPONDER INMEDIATAMENTE
            // =================================================

            await interaction.deferUpdate();


            // =================================================
            // 🎪 COMPROBAR STOCK
            // =================================================

            if (
                !stock ||
                typeof stock.generarStock !==
                "function"
            ) {

                throw new Error(
                    "feriaStock.generarStock no existe o no es una función."
                );

            }


            // =================================================
            // 🛒 GENERAR NUEVO STOCK
            // =================================================

            stock.generarStock();


            console.log(
                "🎪 Nuevo stock de Feria generado correctamente."
            );


            // =================================================
            // 📢 BUSCAR CANAL
            // =================================================

            const canal =
                await interaction.client.channels
                    .fetch(
                        CANAL_FERIA
                    )
                    .catch(
                        error => {

                            console.error(
                                "❌ Error obteniendo canal de Feria:",
                                error
                            );

                            return null;

                        }
                    );


            // =================================================
            // 📢 AVISAR EN EL CANAL
            // =================================================

            if (canal) {

                await canal.send(
                    [
                        "🎪 **NUEVA FERIA CREADA**",
                        "",
                        "✨ La Feria anterior fue reemplazada.",
                        "",
                        "🛒 Nuevo stock generado.",
                        "",
                        "🎟️ ¡Ya puedes visitar la Feria!"
                    ].join("\n")
                );

            }


            // =================================================
            // ✅ ACTUALIZAR MENSAJE ORIGINAL
            // =================================================

            return interaction.editReply({

                content:
                    "✅ **Feria creada correctamente.**\n\n🛒 Nuevo stock generado.",

                components: []

            });


        } catch (error) {

            console.error(
                "❌ ERROR CREANDO FERIA:",
                error
            );


            // =================================================
            // ⚠️ SI YA RESPONDIMOS
            // =================================================

            if (
                interaction.deferred
            ) {

                return interaction
                    .editReply({

                        content:
                            "❌ Ocurrió un error al crear la Feria.",

                        components: []

                    })
                    .catch(
                        console.error
                    );

            }


            // =================================================
            // ⚠️ SI TODAVÍA NO RESPONDIMOS
            // =================================================

            if (
                !interaction.replied
            ) {

                return interaction
                    .reply({

                        content:
                            "❌ Ocurrió un error al crear la Feria.",

                        ephemeral: true

                    })
                    .catch(
                        console.error
                    );

            }

        }

    }


    // ========================================================
    // ❌ CANCELAR FERIA
    // ========================================================

    if (
        interaction.customId ===
        "cancelar_createferia"
    ) {

        try {

            return await interaction.update({

                content:
                    "❌ **Creación de Feria cancelada.**",

                components: []

            });

        } catch (error) {

            console.error(
                "❌ ERROR CANCELANDO FERIA:",
                error
            );

            return;

        }

    }


    // ========================================================
    // 🛒 FERIA - COMPRAR
    // ========================================================

    if (
        interaction.customId.startsWith(
            "feria_comprar_"
        )
    ) {

        const id =
            interaction.customId
                .split("_")[2];


        return interaction.reply({

            content:
                [
                    "🛒 **Preparando compra de Feria...**",
                    "",
                    `Objeto seleccionado: **${id}**`
                ].join("\n"),

            ephemeral: true

        });

    }


    // ========================================================
    // ✨ FERIA - PODER
    // ========================================================

    if (
        interaction.customId.startsWith(
            "feria_poder_"
        )
    ) {

        const id =
            interaction.customId
                .split("_")[2];


        return interaction.reply({

            content:
                [
                    "✨ **Información del poder del objeto:**",
                    "",
                    `Objeto: **${id}**`
                ].join("\n"),

            ephemeral: true

        });

    }


    // ========================================================
    // ❌ FERIA - CERRAR MENÚ
    // ========================================================

    if (
        interaction.customId.startsWith(
            "feria_cancelar_"
        )
    ) {

        return interaction.update({

            content:
                "❌ **Menú de Feria cerrado.**",

            components: []

        });

    }

}


// ============================================================
// 📦 EXPORTAR
// ============================================================

module.exports =
    manejarBotones;