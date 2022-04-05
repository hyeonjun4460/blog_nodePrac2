// EXPRESS 등 모듈
const express = require('express')
const joimiddleware = require('../middlewares/joi')
const saltRounds = 10;
exports.saltRounds = saltRounds;
const authMiddleware = require('../middlewares/auth-middleware')

// controller
const { getLogin, login, checkAuth, showRegister, register } = require("../controller/auth");

// 라우터 
const router = express.Router()

// 로그인 페이지 조회 API
router.get('/auth', getLogin())

// 로그인 API
router.post('/auth', login())

// 사용자 인증 API
router.get('/users/me', authMiddleware, checkAuth())

// 회원가입 페이지 조회 API
router.get('/register', showRegister())

// 회원가입 API
router.post('/register', joimiddleware, register())

module.exports = router


