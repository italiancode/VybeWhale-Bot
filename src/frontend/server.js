require('dotenv').config();
const express = require('express');
const path = require('path');
const vybeApi = require('../services/vybeApi');

// Add debug logging for environment variables
console.log('API Base URL:', process.env.VYBE_API_BASE_URL);
console.log('API Key configured:', !!process.env.VYBE_API_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.get('/api/token/:mintAddress', async (req, res) => {
    try {
        const data = await vybeApi.getTokenInfo(req.params.mintAddress);
        res.json(data);
    } catch (error) {
        console.error('Token info endpoint error:', error);
        res.status(500).json({
            error: error.message,
            mintAddress: req.params.mintAddress,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/token/transfers', async (req, res) => {
    try {
        const data = await vybeApi.getWhaleTransactions(req.query.mintAddress, req.query.minUsdAmount);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/account/token-balance/:ownerAddress', async (req, res) => {
    try {
        const data = await vybeApi.getWalletTokenBalance(req.params.ownerAddress);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/token/:mintAddress/top-holders', async (req, res) => {
    try {
        const data = await vybeApi.getTokenTopHolders(req.params.mintAddress);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/token/:mintId/transfer-volume', async (req, res) => {
    try {
        const data = await vybeApi.getTokenTransferVolume(
            req.params.mintId,
            req.query.startTime,
            req.query.endTime
        );
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});