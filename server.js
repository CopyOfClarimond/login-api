const express = require("express");
const request = require("request");
const app = express();
const port = process.env.PORT || 3000; // Use environment port if available

app.use(express.json());

app.all("/api/*", (req, res) => {
    const url = `https://discord.com/api/v9${req.url.replace("/api/", "/")}`;

    console.log(`Forwarding request to: ${url}`);
    console.log(`Request body: ${JSON.stringify(req.body)}`);

    const proxyReq = request({ url, method: req.method, json: req.body });

    proxyReq.on('error', (err) => {
        console.error('Request error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Request error', details: err.message });
        }
    });

    proxyReq.on('response', (proxiedRes) => {
        proxiedRes.pipe(res)
            .on('error', (err) => {
                console.error('Response error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Response error', details: err.message });
                }
            });
    });

    req.pipe(proxyReq);
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
