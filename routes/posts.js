var express = require('express');
var router = express.Router();

const DB = require("../common/database");

//https://day.js.org/docs/en/parse/string-format
const dayjs = require('dayjs')

router.get('/', async (req, res, next) => {
    try {
        const [posts] = await DB.execute({
            psmt: `select * from NOTICE`,
            binding: []
        });

        if (!posts) {
            return res.status(404).json({
                ok: false,
                message: "공지를 찾을 수 없습니다.",
            });
        }

        let ret = new Array();
        
        for (let u in posts) {
            let rt = new Object();
            
            rt.title = posts[u].title;
            rt.createdAt = dayjs(posts[u].created_at).format("YY-MM-DD");

            ret.push(rt);
        }
        res.render('index', { title: JSON.stringify(ret, null, 4) });
        res.json({"users" : ret});
    }
    
    catch (error) {
        console.log(error);
    }

});

router.get('/newNotice', async (req, res) => {
    res.render('post');
})

router.get("/:noticeId", async (req, res) => {
    const noticeId = req.params.noticeId;

    try {
        const [notice] = await DB.execute({
            psmt: `select * from NOTICE where notice_id = ?`,
            binding: [noticeId]
        });

        if (!notice) {
            return res.status(404).json({
                ok: false,
                message: "해당 공지를 찾을 수 없습니다.",
            });
        }

        console.log("notice: %j", notice[0]);
        res.json({
            title: notice[0].title,
            content: notice[0].content,
            createdAt: dayjs(notice[0].created_at).format("YY-MM-DD"),
            user :{
                "id" : notice[0].user_id,
                "name" : notice[0].user_name,
            }
        })
    } catch (e) {
        console.error(e);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});


module.exports = router;
