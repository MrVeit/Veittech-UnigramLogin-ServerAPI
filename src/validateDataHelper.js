const CryptoJS = require('crypto-js');

require('dotenv').config();

const botToken = process.env.BOT_TOKEN;

const sessions = {};

function validateTelegramAuthData(initData) 
{
    const params = new URLSearchParams(initData);
    const paramsObj = Object.fromEntries(params.entries());

    const isDateValid = validateDateByUnixTime(paramsObj);

    if (!isDateValid.isValid) 
    {
        return { isValid: false, message: "Data is expired, try again later" };
    }

    const dataCheckString = Object.keys(paramsObj)
        .filter(key => key !== 'hash')
        .sort()
        .map(key => `${key}=${paramsObj[key]}`)
        .join('\n');

    const secretKey = getEncryptedKey('WebAppData', botToken);
    const calculatedHash = getEncryptedKey(secretKey, dataCheckString, true);

    if (calculatedHash === paramsObj.hash)
    {
        const sessionId = CryptoJS.lib.WordArray.random(16).toString();

        sessions[sessionId] = { initData: paramsObj };

        return { isValid: true, session: sessionId, message: "Data is verified" };
    }

    return { isValid: false, message: "Data validation failed, try again later" };
}

function validateDateByUnixTime(paramObj)
{
    const authDate = parseInt(paramObj.auth_date, 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime - authDate > 86400) 
    {
        return { isValid: false, message: "Data is outdated" };
    }

    return { isValid: true, message: "Date is valid" };
}

function validateSession(sessionId)
{
    if (!sessions[sessionId])
    {
        return { isValid: false, message: "Invalid or expired session" };
    }

    return { isValid: true };
}

function validateSecretKey(secretKey)
{
    if (secretKey !== process.env.CLIENT_SECRET_WORD)
    {
        return { isValid: false, message: "Unauthorized, invalid secret word" };
    }

    return { isValid: true };
}

function checkRequestParams(request)
{
    const { sessionId, secretKey, userId, username, refCode } = request.body;

    if (!sessionId || !userId || !username || !refCode || !secretKey)
    {
        return { isValid: false, message: "Mission paramters" };
    }

    return { isValid: true };
}

function getEncryptedKey(key, message, isHex = false) 
{
    const hash = CryptoJS.HmacSHA256(message, key);

    return isHex ? hash.toString(CryptoJS.enc.Hex) : hash;
}

module.exports = 
{
    sessions,

    validateTelegramAuthData,
    validateSession,
    validateSecretKey,

    checkRequestParams,
};