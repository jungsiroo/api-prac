var express = require('express');
var router = express.Router();

const DB = require("../common/database");

//https://day.js.org/docs/en/parse/string-format
const dayjs = require('dayjs')

/* GET users listing. */
router.get('/', async (req, res, next) => {
    try {
        let user = await DB.showAllUser();

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "해당 유저를 찾을 수 없습니다.",
            });
        }

        ret = new Array();

        rt = {
            ok : false,
            id : 0, 
            user_name :  '',
            student_id : 0,
            type : '',
            applyDate : ''
        }

        for (let u in user) {
            if (user[u].canceled_at)
                continue;
            rt.ok = true;
            rt.id = user[u].user_id;
            rt.user_name = user[u].username;
            rt.student_id = user[u].student_id;

            //즉시실행함수
            rt.type = ((type) => {
                if (!type) {
                    return "일반유저";
                }

                switch (type) {
                    case "sub":
                        return "부관리자";
                    case "primary":
                        return "부관리자";
                    default:
                        return "unknown";
                }
            })(user[u].type);
            rt.applyDate = dayjs(user[u].createdAt).format("YY-MM-DD");

            ret.push(rt);
        }

        res.json(ret);
    }
    
    catch (error) {
        console.log(error);
    }

    res.send('respond with a resource');
});

//유저 상세 조회
router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        //DB.execute의 결과가 [{user_id:123}]; 이런식이라서
        //구조분해할당으로 바로 꺼낸다.
        const [user] = await DB.execute({
            psmt: `select * from USER where user_id = ?`,
            binding: [userId]
        });
        //console.log("user: ", JSON.stringify(user)와 동일
        console.log("user: %j", user);

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "해당 유저를 찾을 수 없습니다.",
            });
        }

        res.json({
            ok: true,

            id: user.user_id,
            name: user.name,
            student_id: user.student_id,

            //즉시실행함수
            type: ((type) => {
                if (!type) {
                    return "일반유저";
                }

                switch (type) {
                    case "sub":
                        return "부관리자";
                    case "primary":
                        return "부관리자";
                    default:
                        return "unknown";
                }
            })(user.type),

            applyDate: dayjs(user.createdAt).format("YY-MM-DD"),
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
