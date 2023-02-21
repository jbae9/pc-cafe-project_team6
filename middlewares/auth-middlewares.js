const jwt = require("jsonwebtoken");
const { Users, PCOrders } = require("../models")
const RedisService = require('../services/redis.service')
const JwtService = require('../services/jwt.service')
const secretKey = process.env.JWT_SECRET_KEY

async function auth_middleware(req, res, next) {
    try {
        const redisService = new RedisService()
        const jwtService = new JwtService()

        const { accessToken, refreshToken } = req.signedCookies
        console.log(accessToken, refreshToken)


        // Check if refresh token exists on Redis
        const redisRefreshToken = !refreshToken ? [] : await redisService.get(refreshToken)
        console.log(redisRefreshToken)

        // jwt.verify를 이용해 access 토큰값 인증
        const accessDecoded = jwt.verify(accessToken, secretKey, function (err, decoded) {
            if (err) {
                return undefined
            } else {
                // 1. Access token not expired, refresh token expired => create new refresh token
                if (redisRefreshToken.length === 0) {
                    const newRefreshToken = jwtService.createRefreshToken()
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, signed: true })
                    redisService.set({
                        key: newRefreshToken,
                        value: decoded.userId,
                        timeType: "EX",
                        time: process.env.JWT_REFRESH_TOKEN_TIME
                    })
                }
                return decoded
            }
        })


        // If access token expired or undefined
        let checkRefreshToken
        if (accessDecoded === undefined) {
            // Verify refresh token
            checkRefreshToken = jwt.verify(refreshToken, secretKey, function (err, decoded) {
                if (err) {
                    return undefined
                } else {
                    return decoded
                }
            })

            if (!checkRefreshToken && redisRefreshToken.length === 0) {
                // 2. If access token expired & refresh token expired => login again
                res.clearCookie("accessToken")
                res.clearCookie("refreshToken")
                res.locals.user = {}
                return next()
            } else {
                // 3. If access token expired and refresh token is not expired => create new access token
                const newAccessToken = jwtService.createAccessToken(redisRefreshToken)
                res.cookie("accessToken", newAccessToken, { httpOnly: true, signed: true })
            }
        }        


        // If access token is not expired
        const userId = accessDecoded?.userId === undefined ? parseInt(redisRefreshToken) : accessDecoded.userId

        const user = await Users.findByPk(userId, { attributes: ['userId', 'id', 'name', 'points', 'role'], raw: true })
        res.locals.user = user;

        const pcOrder = await PCOrders.findAll({
            where: { userId: userId },
            attributes: ['userId', 'pcId', 'endDateTime'],
            order: [['endDateTime', 'DESC']],
            raw: true
        })

        if (!pcOrder[0]) {
            res.locals.pcOrder = {}
        } else {
            res.locals.pcOrder = pcOrder[0]
        }

        next();

    } catch (error) {
        console.log(error)
        res.clearCookie('accessToken')
        res.status(500).send({ error });
    }
}


module.exports = auth_middleware;