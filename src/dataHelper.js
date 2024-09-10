const Session = require('./models/sessionModel');
const RefreshToken = require('./models/refreshTokenModel');

async function saveUserSession(sessionId, userId)
{
    const session = new Session({ sessionId, userId });

    await session.save();
}

async function loadUserSession(sessionId)
{
    return await Session.findOne({ sessionId });
}

async function loadUserSessionById(userId)
{
    return await Session.findOne({ userId });
}

async function saveUserRefreshToken(tokenId, userId)
{   
    const existingToken = await loadUserRefreshTokenByUserId(userId);

    if (existingToken)
    {
        console.warn('Refresh token for this user already exists');

        return;
    }

    const refreshToken = new RefreshToken({ tokenId, userId: Number(userId) });

    await refreshToken.save();
}

async function loadUserRefreshToken(tokenId)
{
    const refreshToken = await RefreshToken.findOne({ tokenId });

    return refreshToken;
}

async function loadUserRefreshTokenByUserId(userId)
{
    const refreshToken = await RefreshToken.findOne({ userId });

    return refreshToken;
}

async function deleteUserRefreshToken(tokenId)
{
    await RefreshToken.deleteOne({ tokenId });
}

async function deleteUserSession(sessionId)
{
    await Session.deleteOne({ sessionId });
}

async function updateUserRefreshToken(userId, oldToken, newToken)
{
    try 
    {
        console.log(`User id before convert: ${userId}`);

        const convertedUserId = Number(userId);

        if (isNaN(convertedUserId))
        {
            throw new Error(`Invalid format user id: ${convertedUserId}`);
        }

        const updatedToken = await RefreshToken.findOneAndUpdate(
            { tokenId: oldToken, userId: convertedUserId },
            { tokenId: newToken }, 
            { new: true, timestamps: true }
        );

        if (!updatedToken)
        {
            console.warn('Refresh token not found for update');

            return;
        }

        console.log(`Updated refresh token for user ${userId}`, updatedToken);

        return updatedToken;
    }
    catch (error)
    {
        console.error(`Failed to updating refresh token:`, error);

        throw error;
    }
}

module.exports =
{
    saveUserSession,
    saveUserRefreshToken,
    loadUserSession,
    loadUserSessionById,
    loadUserRefreshToken,
    loadUserRefreshTokenByUserId,
    deleteUserRefreshToken,
    deleteUserSession,
    updateUserRefreshToken,
}