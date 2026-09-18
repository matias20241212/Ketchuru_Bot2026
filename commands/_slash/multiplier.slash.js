// ============================================================
// 🤖 ADAPTADOR SLASH AUTOMÁTICO
// ============================================================

const {
    SlashCommandBuilder
} = require("discord.js");

const comando = require(
    "../Admin/multiplier.js"
);

module.exports = {

    slashOnly: true,

    nombre: "multiplier",

    data: new SlashCommandBuilder()
        .setName(
            "multiplier"
        )
        .setDescription(
            "Versión Slash de !multiplier"
        )
        .addStringOption(option =>
            option
                .setName("arg1")
                .setDescription("Argumento 1")
                .setRequired(true)
        ),

    async execute(interaction, db) {


        const args = [
            interaction.options.getString("arg1")
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
                "!multiplier" +
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
