const bcrypt = require("bcrypt")
const UserService = require("../services/user.service.js")
const RedisService = require('../services/redis.service')
const JwtService = require('../services/jwt.service')

class LoginController {
    userService = new UserService()
    redisService = new RedisService()
    jwtService = new JwtService()

    // 로그인
    login = async (req, res) => {
        const { id, password } = req.body;

        try {
            const userInfo = await this.userService.findOneUser(id);
            const match = await bcrypt.compare(password, userInfo.password);
            if (!match) {
                const error = new Error("패스워드를 확인해주세요");
                error.status = 404;
                throw error;
            }

            const accessToken = this.jwtService.createAccessToken(userInfo.userId)
            const refreshToken = this.jwtService.createRefreshToken()

            res.cookie("accessToken", accessToken, {httpOnly: true, signed: true})
            res.cookie("refreshToken", refreshToken, {httpOnly: true, signed: true})

            await this.redisService.set({
                key: refreshToken,
                value: userInfo.userId,
                timeType: "EX",
                time: process.env.JWT_REFRESH_TOKEN_TIME
            })

            res.status(200).json({
                message: "PC방에 오신 것을 환영합니다.",
                userId: userInfo.userId,
                role: userInfo.role,
            });
        } catch (error) {
            console.error(error);
            res.status(error.status).send({ message: error.message });
        }
    };

    // 로그아웃
    logout = async (req, res) => {
        try {
            const { refreshToken } = req.signedCookies
            await this.redisService.del(refreshToken)
            res.clearCookie("accessToken");
            res.clearCookie('refreshToken')

            return res.status(200).send({ message: "로그아웃 되었습니다." });
        } catch (error) {
            console.log(error)
            return res.status(400).send(error);
        }
    };
}

module.exports = LoginController