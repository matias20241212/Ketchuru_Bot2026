async function obtenerPoints(db, id) {

    const result = await db.query(
        `
        SELECT rebirth_points
        FROM users
        WHERE discord_id=$1
        `,
        [id]
    );

    return result.rows[0]?.rebirth_points || 0;
}


async function añadirPoints(db, id, cantidad) {

    await db.query(
        `
        UPDATE users
        SET rebirth_points = COALESCE(rebirth_points, 0) + $2
        WHERE discord_id=$1
        `,
        [
            id,
            cantidad
        ]
    );

}


module.exports = {
    obtenerPoints,
    añadirPoints
};