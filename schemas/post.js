//  게시글 스키마

const mongoose = require('mongoose')
// 게시글 스키마 생성
const postschema = mongoose.Schema({

    nickname: {
        type: String,
        required: true
    },
    userId_DB: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    date: {
        type: String
    },
    count: {
        type: Number,
        required: true,
        unique: true
    }
})
// 게시글  스키마를 모델로서 묘듈 생성
module.exports = mongoose.model('posts', postschema)