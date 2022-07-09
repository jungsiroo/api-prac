var express = require('express');
var router = express.Router();

const DB = require("../common/database");

//https://day.js.org/docs/en/parse/string-format
const dayjs = require('dayjs')

router.get('/', async (req, res, next) => {
    try {
        let post = await DB.showAllPost();

        if (!post) {
            return res.status(404).json({
                ok: false,
                message: "해당 공지를 찾을 수 없습니다.",
            });
        }

        ret = new Array();

        rt = {
            ok : false,
            notice_id : 0, 
            user_id :  0,
            title : '',
            content : '',
            updated_at : ''
        }

        for (let u in post) {
            if (post[u].canceled_at)
                continue;
            rt.ok = true;
            rt.notice_id = post[u].notice_id;
            rt.user_id = post[u].user_id;
            rt.title = post[u].title;
            rt.content = post[u].content;
            rt.updated_at = dayjs(post[u].updated_at).format("YY-MM-DD");

            ret.push(rt);
        }

        res.json(ret);
    }
    
    catch (error) {
        console.log(error);
    }

    res.send('respond with a resource');
});


module.exports = router;
