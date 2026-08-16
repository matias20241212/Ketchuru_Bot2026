function calcularMultiplicador(rebirth){

    return 1 + (rebirth * 0.02);

}


function aplicarBonus(cantidad,rebirth){

    const multi =
    calcularMultiplicador(rebirth);


    return Math.floor(
        cantidad * multi
    );

}



module.exports={
    calcularMultiplicador,
    aplicarBonus
};