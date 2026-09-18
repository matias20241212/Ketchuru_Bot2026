// ============================================================
// 🤖 ADAPTADOR SLASH AUTOMÁTICO
// ============================================================

const {
    SlashCommandBuilder
} = require("discord.js");

const comando = require(
    "../Economy/Balance.js"
);

module.exports = {

    slashOnly: true,

    nombre: "balance",

    data: new SlashCommandBuilder()
        .setName(
            "balance"
        )
        .setDescription(
            "Versión Slash de !balance"
        ),

    async execute(interaction, db) {

const args = [];

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
                "!balance" +
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


        return comando.execute(
            message,
            args,
            db
        );

    }
};
