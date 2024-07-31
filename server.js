const express = require("express");

const app = express();
app.get("/", (req, res) => {
	res.json({
		"working?": true,
	});
});

app.listen(3000, () => {
	console.log("Listening to 3000");
});
