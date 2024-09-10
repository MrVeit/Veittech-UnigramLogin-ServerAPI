const timeUtils = require('./timeUtils');

const mongoose = require('mongoose');

require('dotenv').config();

const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true,
     serverSelectionTimeoutMS: 30000 });

mongoose.connection.on('connected', () => {
    console.log(`[${timeUtils.timestamp}] Successfully connected to MongoDB`);
});

mongoose.connection.on('error', error => {
    console.error(`[${timeUtils.timestamp}] MongoDB connection failed, reason: ${error}`);
});

module.exports = mongoose;