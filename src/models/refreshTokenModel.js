const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema(
{
    tokenId: { type: String, required: true, unique: true },
    userId: { type: Number, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);