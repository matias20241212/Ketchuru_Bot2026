const fs = require("fs");
const path = require("path");

const entrada = path.join(__dirname, "missions.sql");
const salida = path.join(__dirname, "missions_convertido.sql");

if (!fs.existsSync(entrada)) {
    console.log("❌ No se encontró missions.sql");
    process.exit();
}

const sql = fs.readFileSync(entrada, "utf8");

console.log("✅ missions.sql encontrado");
console.log("📏 Tamaño:", sql.length, "caracteres");

// Busca las filas de las misiones
const regex = /\(\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(?:NULL|'[^']*')\s*\)/g;

let resultado = [];
let match = regex.exec(sql);

while (match !== null) {

    const id = match[1];
    const nombre = match[2].replace(/''/g, "'");
    const descripcion = match[3].replace(/''/g, "'");
    const tipo = match[4];
    const goal = match[5];
    const reward = match[6];

    resultado.push(
        `('${tipo}','${nombre.replace(/'/g, "''")}','${descripcion.replace(/'/g, "''")}',${goal},${reward},'normal','general','coins',NULL,NULL,${reward},NULL)`
    );

    match = regex.exec(sql);
}
console.log("🔎 Filas encontradas:", resultado.length);

if (resultado.length === 0) {
    console.log("❌ No se encontró ninguna misión.");
    process.exit();
}

const encabezado = `INSERT INTO missions
(type, name, description, goal, reward, difficulty, category, reward_type, reward_item, reward_rarity, reward_coins, reward_coupon)
VALUES
`;

fs.writeFileSync(
    salida,
    encabezado + resultado.join(",\n") + ";",
    "utf8"
);

console.log("=================================");
console.log(`✅ Misiones convertidas: ${resultado.length}`);
console.log(`📄 Archivo creado: ${salida}`);
console.log("=================================");