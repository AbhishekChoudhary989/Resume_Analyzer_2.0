const mongoose = require('mongoose');

const KVSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now } // ✅ This field is required for charts
});

module.exports = mongoose.model('KeyValue', KVSchema);