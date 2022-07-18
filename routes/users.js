let express = require('express');
let router = express.Router();

const DB = require("../common/database");

//https://day.js.org/docs/en/parse/string-format
/* GET users listing. */
router.get('/', async (req, res) => {
    try {
        let ret = await DB.getAllUsers(forAdmin=false);
        res.json({"users" : ret});
    }
    
    catch (error) {
        console.log(error);
    }
});

router.post('/:userID/edit', async (req, res) => {
    const userID = req.params.userID;

    const columns = ["password", "username", "name", "email", "company", "github"]
    try {
        const promises = columns.map(async (values, index) =>{
            if (req.body[values]) {
                await DB.execute({
                    psmt : `update USER SET ${values}=?, updated_at = NOW() where user_id = ?`,
                    binding : [req.body[values], userID]
                });
            }
        })
        await Promise.all(promises);
        res.redirect(`/users/${userID}`);
    } catch(error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

router.get("/:userID", async (req, res) => {
    const userID = req.params.userID;

    try {
        let user = await DB.getUser(userID);
        res.json(user);
        
    } catch (e) {
        console.error(e);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

module.exports = router;
