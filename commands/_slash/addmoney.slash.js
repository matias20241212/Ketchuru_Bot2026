// ============================================================
// 🤖 ADAPTADOR SLASH AUTOMÁTICO
// ============================================================

const {
    SlashCommandBuilder
} = require("discord.js");

const comando = require(
    "../addmoney.js"
);

module.exports = {

    slashOnly: true,

    nombre: "addmoney",

    data: new SlashCommandBuilder()
        .setName(
            "addmoney"
        )
        .setDescription(
            "Versión Slash de !addmoney"
        )
        .addStringOption(option =>
            option
                .setName("arg1")
                .setDescription("Argumento 1")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("arg2")
                .setDescription("Argumento 2")
                .setRequired(false)
        ),

    async execute(interaction, db) {


        const args = [
            interaction.options.getString("arg1"),
            interaction.options.getString("arg2")
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
                "!addmoney" +
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


        return comando.ejecutar(
            message,
            args,
            db
        );

    }
};
