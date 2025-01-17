const bcrypt = require("bcrypt");
const UserService = require("../services/user.service.js");

class UserController {
    userService = new UserService();

    // 회원가입
    registerUser = async (req, res) => {
        try {
            const { id, password, phone, name, email, passwordCheck, role, points } =
                req.body;
            const re_email = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
            const re_id = /^[a-zA-Z0-9]{4,12}$/;
            const re_phone = /^[0-9]{3}-[0-9]{3,4}-[0-9]{4}$/;
            const re_password =
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,15}$/; // 8 ~ 15자 영대소문자, 숫자, 특수문자 조합

            // 비밀번호 암호화
            const hashpassword = bcrypt.hashSync(password, 12);
            console.log(hashpassword);

            if (email.search(re_email) === -1) {
                res.status(412).send({
                    errorMessage: "이메일 형식이 올바르지 않습니다.",
                });
                return;
            }
            if (id.search(re_id) === -1) {
                res.status(412).send({
                    errorMessage: "아이디 형식이 올바르지 않습니다.",
                });
                return;
            }
            if (phone.search(re_phone) === -1) {
                res.status(412).send({
                    errorMessage:
                        "휴대폰 번호를 숫자, -을 포함해 휴대전화 번호 형식에 맞게 입력해주세요.",
                });
                return;
            }
            if (password.search(re_password) === -1) {
                res.status(412).send({
                    errorMessage:
                        "비밀번호를 8~15자 영대소문자, 숫자, 특수문자 조합으로 입력해주세요.",
                });
                return;
            }
            if (password !== passwordCheck) {
                res.status(412).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
                return;
            }
            if (name === "") {
                res.status(412).send({ errorMessage: "이름이 올바르지 않습니다." });
                return;
            }

            const existsUsers = await this.userService.findByEmailAndId(email, id);
            console.log(existsUsers);
            if (existsUsers.length) {
                res
                    .status(412)
                    .send({ errorMessage: "이메일 또는 아이디가 이미 사용중입니다." });
                return;
            }

            const registerInfo = await this.userService.registerUser(
                id,
                hashpassword,
                phone,
                name,
                email,
                role,
                points
            );
            res.status(201).json({ result: "success", data: registerInfo });
        } catch (error) {
            console.log(error);
            res
                .status(400)
                .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
        }
    };

    //id로 나의 정보 수정
    updateUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const { id, phone, email, password, confirmPassword } = req.body;

            const hashpassword = bcrypt.hashSync(password, 12);

            if (password !== confirmPassword) {
                const error = new Error(
                    "새 비밀번호가 비밀번호 확인 값과 일치하지 않습니다."
                );
                error.status = 412;
                throw error;
            }

            const updateMyinfo = await this.userService.updateUser(
                userId,
                id,
                phone,
                email,
                hashpassword
            );
            res.status(200).json({ message: "내 정보를 업데이트 완료 했습니다." });
        } catch (error) {
            return res.status(error.status).json({ message: error.message });
        }
    };

    // 이름과 핸드폰 번호로 아이디 찾기
    findByIdNameAndPhone = async (req, res) => {
        try {
            const { name, phone } = req.params;
            console.log(req.params)
            const id = await this.userService.findByIdNameAndPhone(name, phone);
            console.log('컨트롤러', id)
            if (name === undefined) {
                const error = new Error(
                    "해당 이름과 핸드폰으로 등록된 계정이 없습니다."
                );
                error.status = 404;
                throw error;
            }

            res.status(200).send(id);
        } catch (error) {
            console.log(error)
            return res.status(error.status).json({ message: error.message });
        }
    };

    // ID, 이름, 휴대폰 번호로 비밀번호 재설정
    putPasswordByIdNamePhone = async (req, res) => {
        try {
            const { id, name, phone, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                const error = new Error(
                    "새 비밀번호가 비밀번호 확인 값과 일치하지 않습니다."
                );
                error.status = 412;
                throw error;
            }

            const userIdUpdatedPassword =
                await this.userService.putPasswordByIdNamePhone(
                    id,
                    name,
                    phone,
                    password
                );

            res
                .status(201)
                .json({ message: "비밀번호가 성공적으로 변경되었습니다." });
        } catch (error) {
            return res.status(error.status).json({ message: error.message });
        }
    };

    //id로 나의 포인트 조회
    getMyPoint = async (req, res) => {
        try {
            const { userId } = req.params;
            const myPoint = await this.userService.getMyPoint(userId);

            res.status(200).json(myPoint);
        } catch (error) {
            console.log(error);
            return res.status(error.status).json({ message: error.message });
        }
    };

    // (관리자) 회원 정보 조회
    getUserInfo = async (req, res) => {
        try {
            const UserInfo = await this.userService.findUsers();

            res.status(200).send(UserInfo);
        } catch (error) {
            console.log(error);
            return res.status(error.status).json({ message: error.message });
        }
    };

    // (관리자) 회원 삭제
    deleteUser = async (req, res) => {
        try {
            const { userId } = req.params;
            console.log(userId)
            const deleteUser = await this.userService.deleteUser(userId);

            res.status(200).send({ removedId: deleteUser });
        } catch (error) {
            return res.status(error.status).json({ message: error.message });
        }
    }

    // (관리자) 포인트 변경
    updateUserPoint = async (req, res) => {
        try {
            const { userId } = req.params;
            const { points } = req.body;

            const updatePoint = await this.userService.updatePoint(userId, points);

            res.status(200).send({ updatedPoint: updatePoint });
        } catch (error) {
            return res.status(error.status).json({ message: error.message });
        }
    }
}

module.exports = UserController;
