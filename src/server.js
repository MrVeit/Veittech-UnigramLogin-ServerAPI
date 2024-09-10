const validateHelper = require('./validateDataHelper');
const authHelper = require('./authorizationHelper');
const databaseHelper = require('./dataHelper');
const timeUtils = require('./timeUtils');

const mongoose = require('./databaseConnector');

const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const port = process.env.PORT || 3000;
const host = process.env.HOST;
const app = express();

app.use(bodyParser.json());

app.get('/api/current-time', (request, result) =>
{
    result.status(200).json({ timeTick: timeUtils.getUnixTime() });
});

app.post('/api/validate-session', async (request, result) => 
{
    const { initData } = request.body;

    if (!initData)
    {
        console.warn(`[${timeUtils.timestamp}] Missing parameters`);

        return result.status(400).json({ isValid: false, message: "Missing parameters" });
    }

    const resultData = validateHelper.validateTelegramAuthData(initData);

    if (!resultData.isValid) 
    {
        console.warn(`[${timeUtils.timestamp}] Telegram init data is expired`);

        return result.status(400).json(resultData);
    }

    const { userId } = resultData;

    const existingSession = await databaseHelper.loadUserSessionById(userId);
    const userSessionId = authHelper.generateSession();

    if (existingSession)
    {
        return result.status(200).json({ isValid: true,
             session: existingSession.sessionId, message: "Previously saved client session detected" });
    }

    console.log(`[${timeUtils.timestamp}] Validate telegram init dataa successfully finished`)

    await databaseHelper.saveUserSession(userSessionId, userId);

    result.status(200).json({ isValid: true,
        session: userSessionId, message: "Data is verified, validation successfully finished" });
});

app.post('/api/sign-up', async (request, result) =>
{
    const { sessionId, secretKey, userId, username } = request.body;

    const paramCheck = validateHelper.checkRequestParams(request);

    if (!paramCheck.isValid)
    {
        console.warn(`[${timeUtils.timestamp}] Something is wrong with the parameters...`);

        return result.status(400).json(paramCheck);
    }

    const secretCheck = validateHelper.validateSecretKey(secretKey);

    if (!secretCheck.isValid)
    {
        console.warn(`[${timeUtils.timestamp}] The secret key doesn't match`);

        return result.status(403).json(secretCheck);
    }

    const session = await databaseHelper.loadUserSession(sessionId);

    if (!session)
    {
        console.warn(`[${timeUtils.timestamp}] Invalid or expired session, authorize from telegram again`);

        return result.status(403).json({ success: false,
             message: 'Invalid or expired session, authorize from telegram again!'});
    }

    const existingRefreshToken = await databaseHelper.loadUserRefreshTokenByUserId(userId);

    console.log(`Token Id: ${existingRefreshToken.tokenId} by user: ${userId}`);

    if (existingRefreshToken)
    {
        const newAccessToken = authHelper.generateAccessToken({ userId, username });

        console.log(`[${timeUtils.timestamp}] Sessions tokens by user ${userId} founded`);

        return result.status(200).json(
        { 
            success: true,
            accessToken: newAccessToken,
            refreshToken: existingRefreshToken.tokenId
        });
    }

    const authTokens = authHelper.generateAuthTokens({ userId, username });

    if (!authTokens)
    {
        return result.status(403).json({ isValid: false, 
            message: 'UserId or username is missing, try again later'});
    }

    console.log(`Access token: ${authTokens.accessToken}, refresh token: ${authTokens.refreshToken}`);

    await databaseHelper.saveUserRefreshToken(authTokens.refreshToken, Number(userId));

    console.log(`[${timeUtils.timestamp}] Check-in in the database was successful`)

    result.status(200).json({ success: true,
        accessToken: authTokens.accessToken, refreshToken: authTokens.refreshToken });
});

app.post('/api/update-token', async (request, result) =>
{
    const { refreshToken } = request.body;

    if (!refreshToken)
    {
        console.warn(`[${timeUtils.timestamp}] No refresh token provided`);

        return result.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const availableToken = await databaseHelper.loadUserRefreshToken(refreshToken);

    if (!availableToken)
    {
        return result.status(403).json({ success: false, message: 'Refresh token is not exist' })
    }

    console.log(`[${timeUtils.timestamp}] User Id after load: ${availableToken.userId}`);

    if (!availableToken)
    {
        console.warn(`[${timeUtils.timestamp}] Invalid refresh token or your session is not exist`);

        return result.status(403).json({ success: false, message: 'Invalid refresh token or your session is not exist'})
    }

    console.log(`Token for update: ${refreshToken}`);

    authHelper.updateRefreshToken(refreshToken, async (updatedToken) =>
        {
            if (!updatedToken.success)
            {
                console.warn(`[${timeUtils.timestamp}] Failed to update refresh token, something wrong...`);

                return result.status(403).json(updatedToken);
            }

            await databaseHelper.updateUserRefreshToken(availableToken.userId,
                refreshToken, updatedToken.refreshToken);
            
            console.log(`[${timeUtils.timestamp}] Refresh token for user ${availableToken.userId} successfully updated: ${updatedToken.refreshToken}`);

            return result.status(200).json(updatedToken);
        });
});

mongoose.connection.once('open', () => 
{
    app.listen(port, () => {
        console.log(`[${timeUtils.timestamp}] API Server launched at ${host}:${port}`);
    });
});