let express = require("express");
let router = express.Router();

const DB = require("../common/database");

router.get('/', async (req, res) => {
    try {
        let users = await DB.getAllUsers(forAdmin=true);
        let posts = await DB.getAllPostsList(forAdmin=true);
        res.json({"users" : users, "posts":posts});
    }
    
    catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

router.post('/newUser', async (req, res) => {
    try {
        await DB.execute({
            psmt: `insert into USER (username, password, email, student_id, name, type, generation, company, github, created_at, updated_at) \
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            binding: [req.body['username'], req.body['password'], req.body['email'], req.body['student_id'], req.body['name'], req.body['type'],
                      req.body['generation'],req.body['company'], req.body['github']]
        });

        res.redirect('/admin');
    } catch(error){
        console.log(error)

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
})


router.post('/users/:userID/edit', async (req, res) => {
    const userID = req.params.userID;

    try {
        await DB.execute({
            psmt : `update USER SET canceled_at = ? where user_id = ?`,
            binding : [req.body.canceled_at, userID]
        });
        res.redirect(`/admin/users/${userID}`);
    } catch(error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

router.get("/users/:userID", async (req, res) => {
    const userID = req.params.userID;

    try {
        let user = await DB.getUser(userID, forAdmin=true);
        let posts = await DB.getPostsByUserID(userID);
        res.json({"info":user, "posts":posts});
        
    } catch (e) {
        console.error(e);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
});

module.exports = router;
