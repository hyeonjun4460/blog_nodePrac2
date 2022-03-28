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