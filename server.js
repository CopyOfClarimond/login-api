const express = require("express");
const request = require("request");
const app = express();
const port = 3000;

app.use(express.json());

app.all("/api/*", (req, res) => {
    const url = `https://discord.com/api/v9${req.url.replace("/api/", "/")}`;

    console.log(`Forwarding request to: ${url}`);
    console.log(`Request body: ${JSON.stringify(req.body)}`);

    req.pipe(request({ url, method: req.method, json: req.body }))
        .on('error', (err) => {
            console.error('Request error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'An error occurred' });
            }
        })
        .on('response', (proxiedRes) => {
            proxiedRes.headers['content-type'] = 'application/json';
        })
        .pipe(res);
});
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
