const DB = require("../common/database");
const MSG = require("../common/message");
const dayjs = require('dayjs');

const getAllPosts = async (forAdmin=false) => {
    try {
        const [posts] = await execute({
            psmt: `select post_id, title, category, username FROM POST INNER JOIN USER ON POST.user_id = USER.user_id;`,
            binding: []
        });

        if (DB.isEmpty(posts)) {
            return DB.getReturnObject(MSG.CANT_READ_DATA, 404, null)
        }

        let ret = new Array();
        
        for (let u in posts) {
            if (!forAdmin && posts[u].canceled_at)
                continue;
            let rt = new Object();
            
            rt.post_id = posts[u].post_id;
            rt.write = posts[u].username;
            rt.title = posts[u].title;
            rt.created_at = dayjs(posts[u].created_at).format("YYYY-MM-DD HH:MM:ss");
            rt.updated_at = dayjs(posts[u].updated_at).format("YYYY-MM-DD HH:MM:ss");
            rt.category = posts[u].category;

            ret.push(rt);
        }

        return DB.getReturnObject(MSG.READ_USERDATA_SUCCESS, 200, ret)
    }
    
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    getAllPosts
}