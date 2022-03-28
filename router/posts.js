// EXPRESS 등 모듈
const express = require('express')
const Posts = require('../schemas/post')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const User = require('../schemas/user')
const joimiddleware = require('../middlewares/joi')
const saltRounds = 10;
const bcrypt = require('bcrypt')
const authMiddleware = require('../middlewares/auth-middleware')

// 라우터 
const app = express()
const router = express.Router()

// 전체 게시글 조회 API
router.get('/', async (req, res) => {
    const post = await (await Posts.find({}, { _id: false, password: false, comment: false })).sort((a, b) => {
        if (a.count > b.count) {
            return -1
        }
    }) // 작성날짜 기준 내림차순 정렬해서 return
    res.render('../views/index', {
        post
    })
})


// 로그인 페이지 조회 API
router.get('/auth', (req, res) => {
    res.render('../views/signup')
})

// 로그인 API
router.post('/auth', async (req, res) => {
    const { id, password } = req.body;
    // DB에 입력된 비밀번호 복호화 하기
    const userpassword = await User.findOne({ id }).then((value) => { return value.password })
    // 복호화된 비밀번호와 입력된 비밀번호 일치하는지 확인하기
    const passwordcheck = await bcrypt.compare(password, userpassword).then((value) => { return value }).catch((error) => { res.status(400).send({ errmsg: '다시 시도해주세요.' }) })
    console.log(password, passwordcheck)
    // 일치하지 않으면, status 400, errormsg 보내기
    if (!passwordcheck) {
        res.status(400).send({
            errormsg: "이메일 또는 패스워드가 잘못됐습니다.",
        });
        return;
    }
    //  일치하다면, email을 가진 유저 찾기
    const user = await User.findOne({ id })
    const token = jwt.sign({ userId: user.userId }, "my-secret-key");
    res.send({
        success: true,
        token,
        msg: '로그인 성공!'
    });
})

// 사용자 인증 API
router.get('/users/me', authMiddleware, (req, res) => {
    const { user } = res.locals;
    res.send({
        user
    });
})

// 회원가입 페이지 조회 API
router.get('/register', (req, res) => {
    res.render('../views/register')
})

// 회원가입 API
router.post('/register', joimiddleware, async (req, res) => {
    const { id, nickname, password, confirmPassword } = req.body;

    const existUsers = await User.find({
        $or: [{ id }, { nickname }],
    });
    // 아이디와 닉네임이 중복되지 않게 하기.
    if (existUsers.length) {
        res.status(400).send({
            errorMessage: "이미 가입된 ID 또는 닉네임이 있습니다.",
        });
        return;
    }
    // 비밀번호 암호화
    const pw_hash = await bcrypt.hash(password, saltRounds).then((value) => { return value })

    const user = new User({ id, nickname, password: pw_hash });
    await user.save();
    res.status(201).send({ success: true, msg: '회원가입에 성공했습니다.' });
})


router.get('/upload', (req, res) => {
    res.render('../views/post')
})

// 게시글 POST API
// userDB의DB ID로 작성자 = 로그인한 유저 여부를 인증.
router.post('/upload', async (req, res) => {
    const { tokenid, nickname, title, password, content } = req.body
    // 토큰을 가진 사용자의 DB ID 가져오기
    const { userId } = jwt.verify(tokenid, 'my-secret-key')
    console.log(userId)
    console.log(userId)
    const userId_DB = await User.findOne({ _id: userId }).then((value) => { return value._id.toHexString() })
    console.log(userId_DB)
    const date = new Date()
    // 비밀번호 암호화하기.
    const pw_hash = await bcrypt.hash(password, saltRounds).then((value) => { return value })
    let count = 0
    posts = await Posts.find({})
    if (posts.length === 0) {
        count = 0
    }
    else {
        count = posts[posts.length - 1].count + 1
    }
    console.log(count, posts.length)
    await Posts.create({
        userId_DB,
        nickname,
        title,
        password: pw_hash,
        content,
        date,
        count // 각 게시글에 고유값 지정 위해서...
    })
    res.json({ success: true, msg: '등록 완료!' })

})

// 상세 게시글 조회 API
router.get('/:count', async (req, res) => {
    const Count = req.params.count
    const post = await Posts.find({ count: Number(Count) }, { _id: false, pw: false })
    // res.json({ success: true, post: post })
    res.render('../views/detail', { post })
})
// 수정 페이지 이동
router.get('/:count/edit', async (req, res) => {
    const Count = req.params.count
    const post = await Posts.find({ count: Number(Count) }, { _id: false })
    res.render('../views/edit', { post })
})

// 게시물 수정 API: 입력값과 비밀번호 bcryt 푼 값이 동일한지 확인 추가
router.put('/:count/edit', async (req, res) => {
    const Count = req.params.count
    // request된 비밀번호, 수정 내용 가져오기
    const { content, password } = req.body
    const existpost = await Posts.find({ count: Number(Count) }, { _id: false })
    // existpost의 암호화된 비밀번호와 request받은 비밀번호 비교하기.
    const postpassword = existpost[0].password
    const passwordcheck = await bcrypt.compare(password, postpassword).then((value) => { return value }).catch((error) => { res.status(400).send({ errmsg: '다시 시도해주세요.' }) })
    // 게시글이 존재하고, 비밀번호가 동일하면 삭제
    if (existpost.length) {
        if (passwordcheck) {
            await Posts.updateOne({ count: Number(Count) }, { $set: { content } })
            res.json({ success: true, msg: '수정 완료했습니다.' })
        }
    }
    else {
        res.json({ success: false, errormsg: '비밀번호가 틀립니다.' })
    }
})

//  상세 게시글 삭제
router.delete('/:count/edit', async (req, res) => {
    const Count = req.params.count
    // 비밀번호 가져오기
    const { password } = req.body
    // 포스트 DB에서 상세 게시글 데이터 가져오기
    const existpost = await Posts.find({ count: Number(Count) }, { _id: false })
    // 포스트 DB에서 비밀번호 복호화해서 입력값 비밀번호와 비교하기
    const postpassword = existpost[0].password
    const passwordcheck = await bcrypt.compare(password, postpassword).then((value) => { return value }).catch((error) => { res.status(400).send({ errmsg: '다시 시도해주세요.' }) })
    // 게시글이 존재하고, 비밀번호가 동일하면 삭제
    if (existpost.length) {
        if (passwordcheck) {
            await Posts.deleteOne({ count: Number(Count) })
            res.json({ success: true, msg: '삭제했습니다.' })
        }
        else {
            res.json({ success: false, errormsg: '비밀번호가 틀립니다.' })
        }
    }
})
// 상세 게시글 - 댓글 POST API

//router.post()
// 댓글 POST API with DB 스키마 제작(nickname, comment, userID_DB, contentID_DB)
// 댓글 GET API to 상세페이지
// 댓글 patch API
// 댓글 delete API
module.exports = router