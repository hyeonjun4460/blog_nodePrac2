//  게시글 스키마

const mongoose = require('mongoose')
// 게시글 스키마 생성
const postschema = mongoose.Schema({
    userId_DB: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
    }
})
// 게시글  스키마를 모델로서 묘듈 생성
module.exports = mongoose.model('postDB', postschema)