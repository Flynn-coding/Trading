// index.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fetch top traders from DexScanner
async function fetchTopTraders() {
    try {
        const response = await axios.get('https://api.dexscanner.com/top-traders'); // Replace with the actual endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching top traders:', error);
        return [];
    }
}

// Fetch transactions for a trader
async function fetchTraderTransactions(walletAddress) {
    try {
        const response = await axios.get(`https://api.dexscanner.com/wallet/${walletAddress}`); // Replace with the actual endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching trader transactions:', error);
        return [];
    }
}

// Analyze transactions and provide recommendations
function analyzeTransactions(transactions) {
    const recommendations = [];
    transactions.forEach(tx => {
        if (tx.type === 'buy') {
            recommendations.push({ coin: tx.coin, action: 'Buy' });
        } else if (tx.type === 'sell') {
            recommendations.push({ coin: tx.coin, action: 'Sell' });
        }
    });
    return recommendations;
}

// API endpoint to get trader data
app.get('/api/traders', async (req, res) => {
    const traders = await fetchTopTraders();
    const traderData = [];

    for (const trader of traders) {
        const transactions = await fetchTraderTransactions(trader.wallet);
        const recommendations = analyzeTransactions(transactions);
        traderData.push({ trader: trader.name, recommendations });
    }

    res.json(traderData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
