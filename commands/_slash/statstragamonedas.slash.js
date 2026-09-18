// ============================================================
// 🤖 ADAPTADOR SLASH AUTOMÁTICO
// ============================================================

const {
    SlashCommandBuilder
} = require("discord.js");

const comando = require(
    "../Economy/statstragamonedas.js"
);

module.exports = {

    slashOnly: true,

    nombre: "statstragamonedas",

    data: new SlashCommandBuilder()
        .setName(
            "statstragamonedas"
        )
        .setDescription(
            "Versión Slash de !statstragamonedas"
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
                "!statstragamonedas" +
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
