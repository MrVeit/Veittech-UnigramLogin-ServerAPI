const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
{
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Number, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);