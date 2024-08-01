const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const response = await axios.post("https://discord.com/api/v9/auth/login", {
			email,
			password,
		});
		res.json(response.data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Login failed" });
	}
});

app.listen(3000, () => {
	console.log("CORS proxy server listening on port 3000");
});
