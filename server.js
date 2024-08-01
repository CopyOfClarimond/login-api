const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const { setTimeout } = require("timers/promises");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const capmonsterKey = "17dbc3740eca6931ca7490b095697197"; // Your CapMonster API key
const websiteKey = "4c672d35-0701-42b2-88c3-78380b0db560";
const websiteURL = "https://discord.com/channels/@me";
const inviteURL = "https://discord.com/api/v9/invites/invite";

// Function to solve captcha
async function solveCaptcha() {
	for (let i = 0; i < 15; i++) {
		try {
			const createTaskResponse = await axios.post(
				"https://api.capmonster.cloud/createTask",
				{
					clientKey: capmonsterKey,
					task: {
						type: "HCaptchaTaskProxyless",
						websiteURL: websiteURL,
						websiteKey: websiteKey,
					},
				},
			);
			const taskId = createTaskResponse.data.taskId;
			console.log(`Captcha Task: ${taskId}`);

			let getResults = { status: "processing" };
			while (getResults.status === "processing") {
				await setTimeout(1000);
				const getResultsResponse = await axios.post(
					"https://api.capmonster.cloud/getTaskResult",
					{
						clientKey: capmonsterKey,
						taskId: taskId,
					},
				);
				getResults = getResultsResponse.data;
			}

			return getResults.solution.gRecaptchaResponse;
		} catch (error) {
			console.error(`Error solving captcha: ${error.message}`);
			await setTimeout(1000);
		}
	}
	throw new Error("Failed to solve captcha");
}

// Middleware for JSON body parsing with additional error handling
app.use((err, req, res, next) => {
	if (err) {
		console.error(`Error parsing request body: ${err.message}`);
		return res.status(400).json({ error: "Invalid JSON" });
	}
	next();
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const response = await axios.post("https://discord.com/api/v9/auth/login", {
			email,
			password,
		});

		// Handle captcha challenge if necessary
		if (response.data.captcha_required) {
			const captchaSolution = await solveCaptcha();
			const retryResponse = await axios.post(
				"https://discord.com/api/v9/auth/login",
				{
					email,
					password,
					captcha_key: captchaSolution,
				},
			);
			res.json(retryResponse.data);
		} else {
			res.json(response.data);
		}
	} catch (error) {
		console.error(`Login error: ${error.message}`);
		res.status(500).json({ error: "Login failed" });
	}
});

app.listen(3000, () => {
	console.log("CORS proxy server listening on port 3000");
});
