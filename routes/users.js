let express = require('express');
let router = express.Router();

const DB = require("../common/database");
const UserRepo = require("../users/repository");

router.get('/', async (req, res) => {
    try {
        let ret = await UserRepo.getAllUsers(forAdmin=false);
        
        res.status(ret.status).json(ret);
    }
    
    catch (error) {
        res.status(500).json(
            DB.getReturnObject(error, 500, null)
        )
    }
});

router.get("/:userID", async (req, res) => {
    const userID = req.params.userID;

    try {
        let user = await UserRepo.getUser(userID);
        res.status(user.status).json(user);
        
    } catch (e) {
        console.log(e);
        res.status(500).json(
            DB.getReturnObject("알 수 없는 오류가 발생했습니다.", 500, null)
        )
    }
});

router.put('/:userID/edit', async (req, res) => {
    const userID = req.params.userID;

    const columns = ["password", "username", "name", "email", "company", "github"]
    try {
        const promises = columns.map(async (values) =>{
            if (req.body[values]) {
                UserRepo.editUser(userID, values, req.body[values]);
            }
        })
        await Promise.all(promises);
        res.redirect(`/users/${userID}`);
    } catch(error) {
        console.log(error);
        res.status(500).json(
            DB.getReturnObject("알 수 없는 오류가 발생했습니다.", 500, null)
        )
    }
});



module.exports = router;
