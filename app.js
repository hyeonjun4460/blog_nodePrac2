const express = require('express')
const app = express()
const port = 3000
const authRouter = require('./router/auth')
const boradRouter = require('./router/boards')
const commentRouter = require('./router/comments')
const connect = require('./model/index')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output')
require('dotenv').config()
connect()

// 뷰 엔진 및 경로 설정
app.set('view engine', 'ejs')
app.set('views', './views')
const requestlog = (req, res, next) => {
    console.log('requested url', req.originalUrl, '-', new Date())
    next()
}
// 미들워어
app.use(express.urlencoded({ extended: false })) // form -urlencoded 이용
app.use(express.json()) // json 형식 이용
app.use(requestlog) // 로그 남기기
app.use('/posts', [authRouter, boradRouter, commentRouter]) // /posts 접속시, postrouter의 내용 response
app.use(express.static('views'))
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// 메인 페이지 생성 -> posts로 바로 이동하게 바꾸기
app.get('/', (req, res) => {
    res.render('start')
})

// 포트연결
app.listen(port, () => {
    console.log(port, '로 연결되었습니다.')
})
