const express = require('express');
const router = express.Router();
const KeyValue = require('../models/KeyValue');

// ✅ GET Endpoint: Used by Resume Page to load data
router.get('/get/:key', async (req, res) => {
    try {
        const item = await KeyValue.findOne({ key: req.params.key });
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item.value);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ SET Endpoint: Updates data AND timestamp for history tracking
router.post('/set', async (req, res) => {
    try {
        const { key, value } = req.body;
        await KeyValue.findOneAndUpdate(
            { key },
            {
                key,
                value,
                createdAt: new Date() // ✅ CRITICAL: Updates time for the graph
            },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ HISTORY Endpoint: Fetches data for the Dashboard Charts
router.get('/history', async (req, res) => {
    try {
        // Find all resumes, sort by oldest to newest
        const history = await KeyValue.find({ key: { $regex: '^resume:' } })
            .sort({ createdAt: 1 })
            .limit(30);

        // Format for the Chart
        const chartData = history.map(doc => ({
            date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
            score: doc.value.overallScore || 0,
        }));

        res.json(chartData);
    } catch (err) {
        console.error("History Error:", err);
        res.json([]);
    }
});

// ✅ LIST Endpoint: Used by Home Page grid
router.post('/list', async (req, res) => {
    try {
        const all = await KeyValue.find({ key: { $regex: '^resume:' } });
        const values = all.map(doc => doc.value);
        res.json(values);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;