const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/user');
const { saltRounds } = require("../router/auth");

function getLogin() {
    return (req, res) => {
        res.render('../views/signup');
    };
}

function checkAuth() {
    return (req, res) => {
        const { user } = res.locals;
        res.send({
            user
        });
    };
}

function login() {
    return async (req, res) => {
        const { nickname, password } = req.body;
        if (nickname === '' || password === '') {
            res.status(400).json({ errormsg: "아이디 또는 패스워드를 입력해주세요." })
        }
        else {
            // DB에 입력된 비밀번호 복호화 하기
            const userpassword = await User.findOne({ nickname }).then((value) => { return value.password; });
            // 복호화된 비밀번호와 입력된 비밀번호 일치하는지 확인하기
            const passwordcheck = await bcrypt.compare(password, userpassword).then((value) => { return value; }).catch((error) => { res.status(400).send({ errmsg: '다시 시도해주세요.' }); });
            // 일치하지 않으면, status 400, errormsg 보내기
            if (!passwordcheck) {
                res.status(400).json({
                    errormsg: "아이디 또는 패스워드를 확인해주세요.",
                });
                return;
            }
            //  일치하다면, email을 가진 유저 찾기
            const user = await User.findOne({ nickname });
            const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY);
            console.log(user, token)
            res.json({
                success: true,
                token,
                msg: '로그인 성공!'
            });
        };
    }
}

function register() {
    return async (req, res) => {
        const { nickname, password, confirmPassword } = req.body;
        const existUsers = await User.find({
            nickname
        });
        if (password.search(nickname) != -1) {
            res.status(400).json({
                errormsg: "다른 비밀번호를 입력해주세요"
            });
            return;
        }
        // 아이디와 닉네임이 중복되지 않게 하기.
        if (existUsers.length) {
            res.status(400).json({
                errormsg: "이미 가입된 ID 또는 닉네임이 있습니다.",
            });
            return;
        }
        // 비밀번호 암호화
        const pw_hash = await bcrypt.hash(password, saltRounds).then((value) => { return value; });

        const user = new User({ nickname, password: pw_hash });
        await user.save();
        res.status(201).json({ success: true, msg: '회원가입에 성공했습니다.' });
    };
}

function showRegister() {
    return (req, res) => {
        res.render('../views/register');
    };
}

module.exports = { getLogin, register, showRegister, checkAuth, login }