const jwt = require('jsonwebtoken');
const Posts = require('../model/post');
const User = require('../model/user');
const commentDB = require('../model/comment');

function deletePost() {
    return async (req, res) => {
        const Count = req.params.count;
        const { tokenid } = req.body;
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        // 비밀번호 가져오기
        // 포스트 DB에서 상세 게시글 데이터 가져오기
        const existpost = await Posts.find({ count: Number(Count), userId_DB: userId }, { _id: false });
        // 포스트 DB에서 비밀번호 복호화해서 입력값 비밀번호와 비교하기
        // 게시글이 존재하고, 비밀번호가 동일하면 삭제
        if (existpost.length) {
            await Posts.deleteOne({ count: Number(Count) });
            res.json({ success: true, msg: '삭제했습니다.' });
        }
        else {
            res.status(401).json({ success: false, errormsg: '삭제 권한이 없습니다.' });
        }
    };
}

function editPost() {
    return async (req, res) => {
        const Count = req.params.count;
        // request된 비밀번호, 수정 내용 가져오기
        const { content, tokenid } = req.body;
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        const existpost = await Posts.find({ count: Number(Count), userId_DB: userId }, { _id: false });
        // existpost의 암호화된 비밀번호와 request받은 비밀번호 비교하기.
        // 게시글이 존재하고, 비밀번호가 동일하면 삭제
        if (existpost.length) {
            await Posts.updateOne({ count: Number(Count) }, { $set: { content } });
            res.json({ success: true, msg: '수정 완료했습니다.' });

        }
        else {
            res.status(401).json({ success: false, errormsg: '수정 권한이 없습니다.' });
        }
    };
}

function showDetailPage() {
    return async (req, res) => {
        const Count = req.params.count;
        const post = await Posts.find({ count: Number(Count) }, { _id: false });
        res.render('../views/edit', { post });
    };
}

function showPost() {
    return async (req, res) => {
        const Count = req.params.count;
        const post = await Posts.find({ count: Number(Count) }, { _id: false, pw: false });
        // 댓글 정보 가져오기
        const postId_DB = await Posts.findOne({ count: Number(Count) }).then((value) => { return value._id.toHexString(); });
        const comments = await commentDB.find({ postId_DB }, { _id: false }).sort("-commentCount");
        res.render('../views/detail', { post, comments });
    };
}

function createPost() {
    return async (req, res) => {
        const { tokenid, title, content } = req.body;
        // 토큰을 가진 사용자의 DB ID 가져오기
        const { userId } = jwt.verify(tokenid, process.env.SECRET_KEY);
        const userId_DB = await User.findOne({ _id: userId }).then((value) => { return value._id.toHexString(); });
        const nickname = await User.findOne({ _id: userId }).then((value) => { return value.nickname; });
        const date = new Date();
        // 비밀번호 암호화하기.
        let count = 0;
        posts = await Posts.find({});
        if (posts.length === 0) {
            count = 0;
        }
        else {
            count = posts[posts.length - 1].count + 1;
        }
        await Posts.create({
            userId_DB,
            nickname,
            title,
            content,
            date,
            count // 각 게시글에 고유값 지정 위해서...
        });
        res.json({ success: true, msg: '등록 완료!' });
    };
}

function showBoards() {
    return async (req, res) => {
        const post = await (await Posts.find({}, { _id: false, password: false, comment: false })).sort((a, b) => {
            if (a.count > b.count) {
                return -1;
            }
        }); // 작성날짜 기준 내림차순 정렬해서 return
        res.render('../views/index', {
            post
        });
    };
}

module.exports = { deletePost, editPost, showDetailPage, showPost, createPost, showBoards }