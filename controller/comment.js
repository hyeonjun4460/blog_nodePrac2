const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Posts = require('../model/post');
const commentDB = require('../model/comment');

function createComment() {
    return async (req, res) => {
        const { count } = req.params;
        const { tokenid, comment } = req.body;
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        // userId, comment 가져오기
        const userId_DB = await User.findOne({ _id: userId }).then((value) => { return value._id.toHexString(); });
        // userDB에서 닉네임 가져오기
        const nickname = await User.findOne({ _id: userId }).then((value) => { return value.nickname; });
        // 댓글 번호 만들기
        let commentCount = 0;
        const commentdb = await commentDB.find({});
        if (commentdb.length === 0) {
            commentCount = 0;
        }
        else {
            commentCount = commentdb[commentdb.length - 1].commentCount + 1;
        }
        // 포스트 ID 가져오기
        const postId_DB = await Posts.findOne({ count: Number(count) }).then((value) => { return value._id.toHexString(); });
        // commetDB에 저장하기
        await commentDB.create({
            nickname,
            userId_DB,
            comment,
            postId_DB,
            commentCount
        });
        res.json({ success: true, msg: '등록 완료!' });
    };
}
function patchComment() {
    return async (req, res) => {
        const { count } = req.params;
        const postId_DB = await Posts.findOne({ count: Number(count) });
        const { tokenid, newComment, commentCount } = req.body;
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        const existcomment = await commentDB.findOne({ commentCount, userId_DB: userId });
        if (existcomment) {
            await commentDB.updateOne({ commentCount }, { $set: { comment: newComment } });
            res.json({ success: true, msg: '수정 완료되었습니다.' });
        } else {
            res.status(400).send({ errormsg: '잘못된 요청입니다.' });
        }
    };
}
function deleteComment() {
    return async (req, res) => {
        const { count } = req.params;
        const { tokenid, commentCount } = req.body;
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        // comment db에서 commentCount를 가진 document 찾기
        const existcomment = await commentDB.findOne({ commentCount, userId_DB: userId });
        if (existcomment) {
            await commentDB.deleteOne({ commentCount });
            res.json({ success: true, msg: '삭제했습니다.' });
        }
        else {
            res.status(400).json({ suceess: false, msg: '게시글을 다시 확인해주세요.' });
        }
    };
}

module.exports = { createComment, patchComment, deleteComment }