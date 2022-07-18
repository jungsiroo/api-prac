let express = require('express');
let router = express.Router();

const DB = require("../common/database");

router.get('/', async (req, res) => {
    try {
        let ret = await DB.getAllPostsList();
        res.json({"posts" : ret});
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }

});

router.post('/newPost', async (req, res) => {
    try {
        const [data] = await DB.execute({
            psmt: `select * from USER where user_id = ?`,
            binding: [req.body['userid']]
        });

        if (!data || !data[0].type) {
            return res.status(400).json({
                success: false,
                message: "권한이 없습니다. ",
            });
        }

        await DB.execute({
            psmt: `insert into POST (title, content, user_id, category, created_at, updated_at) VALUES(?, ?, ?, ?, NOW(), NOW())`,
            binding: [req.body['title'], req.body['content'], req.body['userid'], req.body['category']]
        });

        res.redirect('/posts');
    } catch(error){
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
})

router.get("/:postID", async (req, res) => {
    const postID = req.params.postID;

    try {
        let post = await DB.getPost(postID);
        res.json(post);
    } catch (e) {
        console.error(e);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

router.post('/:postID/edit', async (req, res) => {
    const postID = req.params.postID;

    const columns = ["title", "content", "category"]
    try {
        const promises = columns.map(async (values, index) =>{
            if (req.body[values]) {
                await DB.execute({
                    psmt : `update POST SET ${values}=?, updated_at = NOW() where post_id = ?`,
                    binding : [req.body[values], postID]
                });
            }
        })
        await Promise.all(promises);
        res.redirect(`/posts/${postID}`);
    } catch(error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});


module.exports = router;
