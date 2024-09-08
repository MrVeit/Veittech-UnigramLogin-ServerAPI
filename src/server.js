const validateHelper = require('./validateDataHelper');
const authHelper = require('./authorizationHelper');

const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const port = process.env.PORT || 3000;
const host = process.env.HOST;
const app = express();

app.use(bodyParser.json());

app.post('/api/validate-session', (request, result) => 
{
    const { initData } = request.body;

    if (!initData)
    {
        return result.status(400).json({ isValid: false, message: "Missing parameters" });
    }

    const resultData = validateHelper.validateTelegramAuthData(initData);

    if (!resultData.isValid) 
    {
        return result.status(400).json(resultData);
    }

    result.status(200).json(resultData);
});

app.post('/api/sign-up', (request, result) =>
{
    const { sessionId, secretKey, userId, username, refCode } = request.body;

    const paramCheck = validateHelper.checkRequestParams(request);

    if (!paramCheck.isValid)
    {
        return result.status(400).json(paramCheck);
    }

    const sessionCheck = validateHelper.validateSession(sessionId);

    if (!sessionCheck.isValid)
    {
        return result.status(403).json(sessionCheck);
    }

    const secretCheck = validateHelper.validateSecretKey(secretKey);

    if (!secretCheck.isValid)
    {
        return result.status(403).json(secretCheck);
    }

    const mainAccessToken = authHelper.generateAccessToken({ userId, username });
    const mainRefreshToken = authHelper.generateRefreshToken({ userId, username });

    delete validateHelper.sessions[sessionId];

    result.status(200).json({ success: true, accessToken: mainAccessToken, refreshToken: mainRefreshToken });
});

app.post('/api/update-token', async (request, result) =>
{
    const { refreshToken } = request.body;

    if (!refreshToken)
    {
        return result.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    if (!authHelper.refreshSessionTokens[refreshToken])
    {
        return result.status(403).json({ success: false, message: 'Invalid refresh token'});
    }

    authHelper.updateRefreshToken(refreshToken, (updatedToken) =>
        {
            if (!updatedToken.success)
            {
                return result.status(403).json(updatedToken);
            }
            
            return result.status(200).json(updatedToken);
        });
});

app.listen(port, () => {
    console.log(`API Server launched at ${host}:${port}`);
});