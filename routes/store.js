let express = require('express');
let router = express.Router();

const DB = require("../common/database");

router.post('/', async (req, res) => {
    let param = JSON.parse(JSON.stringify(req.body));
    console.log(param)

    try {
        const [data] = await DB.execute({
            psmt: `select * from USER where user_id = ?`,
            binding: [param['userid']]
        });

        console.log("user: %j", data);

        if (!data || !data[0].type) {
            return res.status(400).json({
                success: false,
                message: "권한이 없습니다. ",
            });
        }

        await DB.execute({
            psmt: `insert into NOTICE (title, content, user_id, created_at, updated_at) VALUES(?, ?, ?, NOW(), NOW())`,
            binding: [param['title'], param['content'], param['userid']]
        });

        res.redirect('/posts');
    } catch(error){
        console.log(error)
    }
})


module.exports = router;