// 사용자 인증 미들웨어
// 세팅
const User = require('../model/user')
const joi = require('joi')
const bcrypt = require('bcrypt')

module.exports = (req, res, next) => {
    const { nickname, password, confirmPassword } = req.body

    const joischema = joi.object({
        nickname: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().alphanum().min(4).max(20).required(),
        confirmPassword: joi.ref('password')
    })

    // validation이 잘되면 next, 안되면 에러메시지 띄우고 리턴.
    joischema.validateAsync({ nickname, password, confirmPassword }).then((value) => {
        next()
    }).catch((error) => {
        res.status(401).send({ errormsg: '규격이 안맞아.' })
        return
    })
}
