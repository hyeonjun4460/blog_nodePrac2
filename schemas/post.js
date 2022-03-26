//  게시글 스키마

const mongoose = require('mongoose')

// 게시글 스키마 생성
const postschema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },

    title: {
        type: String
    },
    pw: {
        type: Number,
        required: true
    },
    comment: {
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