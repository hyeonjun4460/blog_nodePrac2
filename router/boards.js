// EXPRESS 등 모듈
const express = require('express')
// controller
const { getUpload, showBoards, createPost, showPost, showDetailPage, editPost, deletePost } = require("../controller/board");

// 라우터 
const app = express()
const router = express.Router()

// 전체 게시글 조회 API
router.get('/', showBoards())

// 게시글 POST API
router.get('/upload', getUpload())
router.post('/upload', createPost())
// 상세 게시글 + 댓글 조회 API
router.get('/:count', showPost())
// 수정 페이지 이동
router.get('/:count/edit', showDetailPage())
// 게시물 수정 API: 입력값과 비밀번호 bcryt 푼 값이 동일한지 확인 추가
router.put('/:count/edit', editPost())
//  상세 게시글 삭제
router.delete('/:count/edit', deletePost())
module.exports = router



