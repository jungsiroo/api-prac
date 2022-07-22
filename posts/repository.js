const DB = require("../common/database");
const MSG = require("../common/message");
const dayjs = require('dayjs');

const getAllPosts = async (forAdmin=false) => {
    try {
        const [posts] = await DB.execute({
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
            rt.writer = posts[u].username;
            rt.title = posts[u].title;
            rt.content = posts[u].content;
            rt.created_at = dayjs(posts[u].created_at).format("YYYY-MM-DD HH:MM:ss");
            rt.updated_at = dayjs(posts[u].updated_at).format("YYYY-MM-DD HH:MM:ss");
            rt.category = posts[u].category;

            ret.push(rt);
        }

        return DB.getReturnObject(MSG.READ_USERDATA_SUCCESS, 200, ret)
    }
    
    catch (error) {
        console.log(error);
        return DB.getReturnObject(MSG.UNKNOWN_ERROR, 500, null);
    }
}

const getPost = async (postID) => {
    try {
        const [data] = await DB.execute({
            psmt: `select * FROM POST INNER JOIN USER ON POST.user_id = USER.user_id where POST.post_id=?;`,
            binding: [postID]
        });

        if (DB.isEmpty(data)) {
            return DB.getReturnObject(MSG.NO_POST_DATA, 404, null)
        }
        let post = data[0];
        let post_obj = new Object();

        post_obj.title = post.title;
        post_obj.content = post.content;
        post_obj.created_at = dayjs(post.created_at).format("YYYY-MM-DD HH:MM:ss");
        post_obj.updated_at = dayjs(post.updated_at).format("YYYY-MM-DD HH:MM:ss");
        post_obj.category = post.category;
        post_obj.user = {
            "user_id" : post.user_id,
            "username" : post.username,
            "email" : post.email,
            "type" : convertType(post.type),
        };

        return DB.getReturnObject(MSG.READ_POST_SUCCESS, 200, post_obj);
    } catch(error) {
        console.log(error);
        return DB.getReturnObject(MSG.UNKNOWN_ERROR, 500, null);
    }
}

module.exports = {
    getAllPosts,
    getPost
}