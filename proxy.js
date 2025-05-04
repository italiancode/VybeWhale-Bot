const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static('src/frontend'));

// Proxy middleware configuration
const apiProxy = createProxyMiddleware({
    target: 'https://api.vybenetwork.xyz',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '' // Remove /api prefix when forwarding
    },
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
});

// Use proxy for all /api/* requests
app.use('/api', apiProxy);

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});

// 