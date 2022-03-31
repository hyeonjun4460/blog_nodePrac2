// 사용자 인증 미들웨어

const User = require('../schemas/user')
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY
// 미들웨어를 모듈로서 다른 파일로 배송
// 미들웨어이므로 반드시 next가 들어감.
module.exports = (req, res, next) => {
    // 사용자 인증 규격인 authorization에 token을 삽입하기 위해, authorization을 선언 및 초기화.
    const { authorization } = req.headers
    // authorization의 type과 token value를 특정해주기 위해 split한 값을 distruction.
    const [tokenType, tokenValue] = authorization.split(' ')

    // 사용자가 보낸 토큰의 타입이 서버가 사용하는 타입인 Bearer가 아닌 경우에는 return.
    if (tokenType != 'Bearer') {
        res.status(401).send({
            errorMessaage: '로그인 후 사용하세요.'
        })
        return
    }
    // try, catch 구문 사용해서 토큰이 잘못되었을 경우에는 리턴하기. (try 구문 실행 중, error 발생 시 catch 구문을 실행.)
    // try: 토큰에 담긴 payload를 복호화해서 DB의 value와 비교하기.
    // catch: 에러메시지 + 리턴
    try {
        const { userId } = jwt.verify(tokenValue, process.env.SECRET_KEY)
        // DB 인증이 성공하면, 사용자 정보를 사용자에게 response하기.(promise를 반환하므로, then을 이용해서 이후 구문을 사용.)
        // res.loclas.user
        // => 아마 브라우저의 로컬스토리지와 같은 공간에 user라는 키에 value user를 할당해서 response하는 것.
        // => 미들웨어에서 라우터에게 변수를 전달하는 것과 같은 함수.
        // => 미들웨어를 통과하는 라우터가 미들웨어와 같은 작업을 하지 않고, 미들웨어에서 사용한 데이터를 그대로 활용할 수 있게 하기 위해 쓰는 함수.
        User.findOne({ _id: userId }).exec().then((user) => {
            res.locals.user = user // locals라는 response 공간에 담긴 user 객체는 미들웨어를 거쳐 jwt 토큰 인증을 받았을 때만 값이 존재함.
            next() // next()는 미들웨어를 통과해도 되는 조건에만 달아줘야한다.
        })
    }
    // verify 에러 시 실행.
    catch (error) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.'
        })
        return
    }
}


