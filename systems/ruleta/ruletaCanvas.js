const { createCanvas } = require("canvas");


function createRuletaImage(selected){

    const canvas = createCanvas(800,800);

    const ctx = canvas.getContext("2d");


    const center = 400;


    ctx.beginPath();
    ctx.arc(
        center,
        center,
        300,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#111";
    ctx.fill();



    const colors = [
        "#ff0000",
        "#000000",
        "#00ff00"
    ];


    const names = [
        "ROJO",
        "NEGRO",
        "VERDE"
    ];


    for(let i = 0; i < 3; i++){

        ctx.beginPath();

        ctx.moveTo(
            center,
            center
        );


        ctx.arc(
            center,
            center,
            290,
            i * Math.PI * 2 / 3,
            (i+1) * Math.PI * 2 / 3
        );


        ctx.fillStyle = colors[i];

        ctx.fill();



        ctx.fillStyle="white";

        ctx.font="40px Arial";

        ctx.fillText(
            names[i],
            300,
            250 + i * 100
        );

    }



    if(selected){

        ctx.fillStyle="white";

        ctx.font="50px Arial";

        ctx.fillText(
            `Ganó ${selected.toUpperCase()}`,
            220,
            700
        );

    }



    return canvas.toBuffer();

}



module.exports = {
    createRuletaImage
};