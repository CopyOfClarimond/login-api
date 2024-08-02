const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 4200;

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "discord.html"));
});

app.listen(port, () => {
	console.log(`✅ Server is running on http://localhost:${port}`);
});
