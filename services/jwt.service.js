const jwt = require("jsonwebtoken")

class JwtService {
    createAccessToken = (userId) => {
        return jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY, {
            expiresIn: `${process.env.JWT_ACCESS_TOKEN_TIME}s`,
        })
    }

    createRefreshToken = () => {
        return jwt.sign({}, process.env.JWT_SECRET_KEY, { expiresIn: `${process.env.JWT_REFRESH_TOKEN_TIME}s` })
    }
}

module.exports = JwtService