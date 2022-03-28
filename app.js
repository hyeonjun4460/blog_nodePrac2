const express = require('express')
const app = express()
const port = 3000
const postsrouter = require('./router/posts')
const connect = require('./schemas/index')
const ejs = require('ejs')
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
app.use('/posts', [postsrouter]) // /posts 접속시, postrouter의 내용 response
app.use(express.static('views'))
// 메인 페이지 생성 -> posts로 바로 이동하게 바꾸기
app.get('/', (req, res) => {
    res.render('start')
})

// 포트연결
app.listen(port, () => {
    console.log(port, '로 연결되었습니다.')
})

