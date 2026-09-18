const express = require("express");
app.get("/config.js", (req, res) => {
    res.type("application/javascript");
    res.send(`window.API_URL = ${JSON.stringify(process.env.API_URL || "")};`);
});

const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Web online en puerto " + PORT);
});