const timeUtils = require('./timeUtils');

const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;

function generateSession()
{
    var newSession = CryptoJS.lib.WordArray.random(16).toString();

    return newSession;
}

function generateAccessToken(payload)
{
    return jwt.sign(payload, CLIENT_SECRET_KEY, { expiresIn: '1h' });
}

function generateRefreshToken(payload)
{
    const refreshToken = jwt.sign(payload, 
        REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    return refreshToken;
}

function generateAuthTokens(payload)
{
    if (!payload.userId || !payload.username)
    {
        console.error(`[${timeUtils.timestamp}] Not specified parameters for generating authentication tokens`);

        return null;
    }

    const mainAccessToken = generateAccessToken(payload);
    const mainRefreshToken = generateRefreshToken(payload);

    console.log(`[${timeUtils.timestamp}] Generated access token: ${mainAccessToken}`);
    console.log(`[${timeUtils.timestamp}] Generated refresh token: ${mainRefreshToken}`);

    return { accessToken: mainAccessToken, refreshToken: mainRefreshToken };
}

function updateRefreshToken(oldRefreshToken, callback)
{
    jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) =>
    {
        if (error)
        {
            console.error(`[${timeUtils.timestamp}] Token verification failed`, error);

            return callback({ success: false, message: 'Invalid refresh token'});
        }
            
        const loadedUserId = user.userId;
        const loadedUsername = user.username;

        const updatedRefreshToken = generateRefreshToken(
        { 
            userId: loadedUserId,
            username: loadedUsername 
        });

        console.log(`Updated token: ${updatedRefreshToken}`);

        return callback({ success: true, refreshToken: updatedRefreshToken });
    });
}

module.exports =
{
    generateSession,
    generateAccessToken,
    generateRefreshToken,
    updateRefreshToken,
    generateAuthTokens,
};