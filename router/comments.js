// EXPRESS 등 모듈
const express = require('express')
// controller
const { createComment, patchComment, deleteComment } = require("../controller/comment");
// 라우터 
const router = express.Router()

// 상세 게시글 - 댓글 POST API
router.post('/:count/comment', createComment())
// 상세 게시글 댓글 patch API
router.patch('/:count/comment', patchComment())
// 상세 게시글 댓글 Delete API
router.delete('/:count/comment', deleteComment())

module.exports = router


