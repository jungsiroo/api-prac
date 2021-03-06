let express = require('express');
let router = express.Router();

const Util = require("../common/util");
const UserRepo = require("../repository/user");

router.get('/', async (req, res) => {
    try {
        let ret = await UserRepo.getAllUsers({forAdmin:false, sortOption : req.query.sort});
        res.status(ret.status).json(ret);
    }
    
    catch (error) {
        console.log(error);
        res.status(500).json(
            Util.getReturnObject(error, 500, {})
        )
    }
});

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        let user = await UserRepo.getUser({userId:userId, forAdmin:false});
        res.status(user.status).json(user);
        
    } catch (error) {
        console.log(e);
        res.status(500).json(
            Util.getReturnObject(error, 500, {})
        )
    }
});

router.patch('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        let result = await UserRepo.editUser({
            userId : userId,
            data : req.body
        })

        res.status(result.status).json(result);
    } catch(error) {
        console.log(error);
        res.status(500).json(
            Util.getReturnObject(error, 500, {})
        )
    }
});


module.exports = router;