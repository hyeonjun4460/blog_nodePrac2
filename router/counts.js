// EXPRESS 등 모듈
const express = require('express')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const joimiddleware = require('../middlewares/joi')
const saltRounds = 10;
const bcrypt = require('bcrypt')
const authMiddleware = require('../middlewares/auth-middleware')

// DB
const User = require('../schemas/user')
const Posts = require('../schemas/post')
const commentDB = require('../schemas/comment');
const comment = require('../schemas/comment');
// 라우터 
const app = express()
const router = express.Router()

// 상세 게시글 + 댓글 조회 API
router.get('/:count', async (req, res) => {
    const Count = req.params.count
    const post = await Posts.find({ count: Number(Count) }, { _id: false, pw: false })
    // 댓글 정보 가져오기
    const postId_DB = await Posts.findOne({ count: Number(Count) }).then((value) => { return value._id.toHexString() })
    const comments = await commentDB.find({ postId_DB }, { _id: false }).sort("-commentCount")
    res.render('../views/detail', { post, comments })
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
    const { content } = req.body
    const existpost = await Posts.find({ count: Number(Count) }, { _id: false })
    // existpost의 암호화된 비밀번호와 request받은 비밀번호 비교하기.
    // 게시글이 존재하고, 비밀번호가 동일하면 삭제
    if (existpost.length) {
        await Posts.updateOne({ count: Number(Count) }, { $set: { content } })
        res.json({ success: true, msg: '수정 완료했습니다.' })

    }
    else {
        res.json({ success: false, errormsg: '비밀번호가 틀립니다.' })
    }
})

//  상세 게시글 삭제
router.delete('/:count/edit', async (req, res) => {
    const Count = req.params.count
    // 비밀번호 가져오기
    // 포스트 DB에서 상세 게시글 데이터 가져오기
    const existpost = await Posts.find({ count: Number(Count) }, { _id: false })
    // 포스트 DB에서 비밀번호 복호화해서 입력값 비밀번호와 비교하기
    // 게시글이 존재하고, 비밀번호가 동일하면 삭제
    if (existpost.length) {
        await Posts.deleteOne({ count: Number(Count) })
        res.json({ success: true, msg: '삭제했습니다.' })
    }
    else {
        res.json({ success: false, errormsg: '비밀번호가 틀립니다.' })
    }
})

// 상세 게시글 - 댓글 POST API
router.post('/:count/comment', async (req, res) => {
    const { count } = req.params
    const { tokenid, comment } = req.body
    const { userId } = jwt.verify(tokenid, 'my-secret-key')
    // userId, comment 가져오기
    const userId_DB = await User.findOne({ _id: userId }).then((value) => { return value._id.toHexString() })
    // userDB에서 닉네임 가져오기
    const nickname = await User.findOne({ _id: userId }).then((value) => { return value.nickname })
    // 댓글 번호 만들기
    let commentCount = 0
    const commentdb = await commentDB.find({})
    if (commentdb.length === 0) {
        commentCount = 0
    }
    else {
        commentCount = commentdb[commentdb.length - 1].commentCount + 1
    }
    // 포스트 ID 가져오기
    const postId_DB = await Posts.findOne({ count: Number(count) }).then((value) => { return value._id.toHexString() })
    // commetDB에 저장하기
    await commentDB.create({
        nickname,
        userId_DB,
        comment,
        postId_DB,
        commentCount
    })
    res.json({ success: true, msg: '등록 완료!' })
})

// 상세 게시글 patch API
router.patch('/:count/comment', async (req, res) => {
    const { count } = req.params
    const postId_DB = await Posts.findOne({ count: Number(count) })
    console.log(postId_DB)
    const { newComment, commentCount } = req.body
    console.log(newComment, commentCount)
    const existcomment = await commentDB.findOne({ commentCount })
    console.log(existcomment)
    if (existcomment) {
        await commentDB.updateOne({ commentCount }, { $set: { comment: newComment } })
        res.json({ success: true, msg: '수정 완료되었습니다.' })
    } else {
        res.status(400).send({ errormsg: '잘못된 요청입니다.' })
    }

})
// 상세 게시글 Delete API
router.delete('/:count/comment', async (req, res) => {
    const { count } = req.params
    const { commentCount } = req.body
    console.log(commentCount)
    // comment db에서 commentCount를 가진 document 찾기
    const existcomment = await commentDB.findOne({ commentCount })
    console.log(existcomment)
    if (existcomment) {
        await commentDB.deleteOne({ commentCount })
        res.json({ success: true, msg: '삭제했습니다.' })
    }
    else {
        res.json({ suceess: false, msg: '게시글을 다시 확인해주세요.' })
    }
})

module.exports = router