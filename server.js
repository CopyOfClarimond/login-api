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

async function solveCaptcha() {
	for (let i = 0; i < 15; i++) {
		try {
			// Create a captcha task
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
				// Wait before polling
				await setTimeout(1000);

				// Get captcha results
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
			console.error(error);
			// Optionally, add a delay before retrying
			await setTimeout(1000);
		}
	}
	throw new Error("Failed to solve captcha");
}

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		// Attempt to login
		const response = await axios.post("https://discord.com/api/v9/auth/login", {
			email,
			password,
		});

		// If login response contains captcha challenge, solve it
		if (response.data.captcha_required) {
			const captchaSolution = await solveCaptcha();
			// Retry login with captcha solution
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
		console.error(error);
		res.status(500).json({ error: "Login failed" });
	}
});

app.listen(3000, () => {
	console.log("CORS proxy server listening on port 3000");
});
