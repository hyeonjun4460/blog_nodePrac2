const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true
    },
    userId_DB: {
        type: String,
        required: true
    },
    postId_DB: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    commentCount: {
        type: Number,
        required: true,
    }
});
commentSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});


// virtual 을 json에포함해서 전송
commentSchema.set("toJSON", {
    virtuals: true,
});
module.exports = mongoose.model("commentDB", commentSchema);