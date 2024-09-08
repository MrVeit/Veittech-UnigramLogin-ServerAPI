const jwt = require('jsonwebtoken');

require('dotenv').config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;

const refreshSessionTokens = {};

function generateAccessToken(payload)
{
    return jwt.sign(payload, CLIENT_SECRET_KEY, { expiresIn: '1h' });
}

function generateRefreshToken(payload)
{
    const refreshToken = jwt.sign(payload, 
        REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    
    refreshSessionTokens[refreshToken] = payload.userId;

    return refreshToken;
}

function updateRefreshToken(oldRefreshToken, callback)
{
    jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) =>
    {
        if (error)
        {
            console.log("Token verification failed:", error);

            return callback({ success: false, message: 'Invalid refresh token'});
        }
            
        const updatedAccessToken = generateAccessToken({ userId: user.userId, username: user.username });

        return callback({ success: true, accessToken: updatedAccessToken });
    });
}

module.exports =
{
    refreshSessionTokens,

    generateAccessToken,
    generateRefreshToken,
    updateRefreshToken
};