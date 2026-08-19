const {
    AttachmentBuilder,
    EmbedBuilder
} = require('discord.js');

const Canvas = require('canvas');
const path = require('path');

// IDs de los canales
const CANAL_BIENVENIDAS = '1465519711763693639';
const CANAL_DESPEDIDAS = '1466504075314204742';

// Imágenes de fondo
const FONDO_BIENVENIDA = path.join(__dirname, 'fondo1.png');
const FONDO_DESPEDIDA = path.join(__dirname, 'fondo2.png');


/**
 * Genera la imagen de bienvenida/despedida
 */
async function generarImagen(usuario, tipo, miembros) {

    const esBienvenida = tipo === 'bienvenida';

    const fondo = esBienvenida
        ? FONDO_BIENVENIDA
        : FONDO_DESPEDIDA;

    // Cargar fondo
    const imagenFondo = await Canvas.loadImage(fondo);

    const canvas = Canvas.createCanvas(
        imagenFondo.width,
        imagenFondo.height
    );

    const ctx = canvas.getContext('2d');

    // Dibujar fondo
    ctx.drawImage(
        imagenFondo,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // ==========================================
    // FOTO DE PERFIL
    // ==========================================

    const avatarURL = usuario.displayAvatarURL({
        extension: 'png',
        size: 512
    });

    const avatar = await Canvas.loadImage(avatarURL);

    // Tamaño del avatar
    const avatarSize = 180;

    // Posición centrada
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 70;

    // Avatar circular
    ctx.save();

    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );

    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
    );

    ctx.restore();

    // ==========================================
    // BORDE DEL AVATAR
    // ==========================================

    ctx.beginPath();

    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 6,
        0,
        Math.PI * 2
    );

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // ==========================================
    // TEXTO PRINCIPAL
    // ==========================================

    ctx.textAlign = 'center';

    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#ffffff';

    const textoPrincipal = esBienvenida
        ? `¡Bienvenido, ${usuario.username}!`
        : `¡Hasta luego, ${usuario.username}!`;

    ctx.fillText(
        textoPrincipal,
        canvas.width / 2,
        avatarY + avatarSize + 80
    );

    // ==========================================
    // SEGUNDO TEXTO
    // ==========================================

    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';

    const textoSecundario = esBienvenida
        ? '¡Esperamos que disfrutes tu estadía!'
        : '¡Esperamos verte nuevamente!';

    ctx.fillText(
        textoSecundario,
        canvas.width / 2,
        avatarY + avatarSize + 125
    );

    // ==========================================
    // INFORMACIÓN DE MIEMBROS
    // ==========================================

    ctx.font = 'bold 26px Arial';

    const textoMiembros = esBienvenida
        ? `👥 Miembro #${usuario.guild.memberCount} • ${miembros} miembros`
        : `👥 Ahora somos ${miembros} miembros`;

    ctx.fillText(
        textoMiembros,
        canvas.width / 2,
        canvas.height - 55
    );

    return canvas.toBuffer('image/png');
}


/**
 * Evento cuando entra un miembro
 */
async function bienvenida(member) {

    try {

        const canal = member.guild.channels.cache.get(
            CANAL_BIENVENIDAS
        );

        if (!canal) {
            console.error(
                '[BIENVENIDAS] No se encontró el canal de bienvenida.'
            );
            return;
        }

        const miembros = member.guild.memberCount;

        const imagen = await generarImagen(
            member.user,
            'bienvenida',
            miembros
        );

        const archivo = new AttachmentBuilder(
            imagen,
            {
                name: 'bienvenida.png'
            }
        );

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(
                `👋 **¡Bienvenido/a ${member}!**\n\n` +
                `🎉 Nos alegra tenerte aquí.\n` +
                `👥 Eres el **miembro #${member.guild.memberCount}** de nuestro servidor.`
            )
            .setImage('attachment://bienvenida.png')
            .setTimestamp();

        await canal.send({
            embeds: [embed],
            files: [archivo]
        });

        console.log(
            `[BIENVENIDAS] ${member.user.tag} ha entrado al servidor.`
        );

    } catch (error) {

        console.error(
            '[BIENVENIDAS] Error al enviar bienvenida:',
            error
        );

    }

}


/**
 * Evento cuando sale un miembro
 */
async function despedida(member) {

    try {

        const canal = member.guild.channels.cache.get(
            CANAL_DESPEDIDAS
        );

        if (!canal) {
            console.error(
                '[DESPEDIDAS] No se encontró el canal de despedidas.'
            );
            return;
        }

        const miembros = member.guild.memberCount;

        const imagen = await generarImagen(
            member.user,
            'despedida',
            miembros
        );

        const archivo = new AttachmentBuilder(
            imagen,
            {
                name: 'despedida.png'
            }
        );

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(
                `😢 **${member.user.username} ha salido del servidor.**\n\n` +
                `👋 ¡Hasta luego! Esperamos volver a verte.\n` +
                `👥 Ahora somos **${miembros} miembros**.`
            )
            .setImage('attachment://despedida.png')
            .setTimestamp();

        await canal.send({
            embeds: [embed],
            files: [archivo]
        });

        console.log(
            `[DESPEDIDAS] ${member.user.tag} ha salido del servidor.`
        );

    } catch (error) {

        console.error(
            '[DESPEDIDAS] Error al enviar despedida:',
            error
        );

    }

}


module.exports = {
    bienvenida,
    despedida
};