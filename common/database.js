const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});

pool.on("release", connection => {
    console.log(`connection ${connection.threadId} released`);
})

const dayjs = require('dayjs');

const convertType = (type) => {
    if (!type) {
        return "비회원";
    }

    switch (type) {
        case "admin":
            return "관리자";
        case "memeber":
            return "회원";
        default:
            return "unknown";
    }
}

const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("connectionId: ", connection.threadId);
        return connection;
    } catch (error) {
        console.log('error on get connection', error);
    }
}
const execute = async params => {
    console.log("on DB execute: %j", params);
    const {psmt, binding} = params;

    let connection;
    try {
        connection = await getConnection();
        
        result = await connection.query(psmt, binding);

        connection.release();
        return result;
    } catch (error) {
        if (!!connection) {
            connection.release();
        }
        throw error;
    }
}

const getAllUsers = async (forAdmin=false) => {
    try {
        const [users] = await execute({
            psmt: `select * from USER`,
            binding: []
        });

        if (!users) {
            return res.status(404).json({
                ok: false,
                message: "해당 유저를 찾을 수 없습니다.",
            });
        }

        let ret = new Array();

        for (let u in users) {
            let rt = new Object();
            if (!forAdmin && users[u].canceled_at)
                continue;

            rt.id = users[u].user_id; // 아이디 
            rt.user_name = users[u].username; // 유저네임
            rt.email = users[u].email; // 이메일
            rt.student_id = users[u].student_id; //학번
            rt.name = users[u].name; // 이름
            rt.generation = users[u].generation;
            rt.company = users[u].company;
            rt.github = users[u].github;
            rt.created_at = dayjs(users[u].created_at).format("YY-MM-DD");
            rt.canceled_at = users[u].canceled_at ? dayjs(users[u].canceled_at).format("YY-MM-DD") : null;
            rt.type = convertType(users[u].type)
            
            ret.push(rt);
        }

        return ret;
    } catch (error) {
        console.log(error);
    }
}

const getUser = async (userId, forAdmin=false) => {
    try {
        const [data] = await execute({
            psmt: `select * from USER where user_id = ?`,
            binding: [userId]
        });

        if (!data) {
            return res.status(404).json({
                ok: false,
                message: "해당 유저를 찾을 수 없습니다.",
            });
        }

        user = data[0];
        let user_obj = new Object();

        user_obj.name = user.name;
        user_obj.id = user.user_id;
        user_obj.user_name = user.username;
        user_obj.student_id = user.student_id;
        user_obj.generation = user.generation;
        user_obj.email = user.email;
        user_obj.github = user.github;
        user_obj.company = user.company;
        user_obj.created_at = user.created_at;
        if (forAdmin)
            user_obj.canceled_at = user.canceled_at;

        user_obj.type = convertType(user.type);

        return user_obj;
    } catch (e) {
        console.error(e);

        res.status(500).json({
            ok: false,
            message: "알 수 없는 오류가 발생했습니다."
        });
    }
}

const getAllPostsList = async (forAdmin=false) => {
    try {
        const [posts] = await execute({
            psmt: `select * from POST`,
            binding: []
        });

        if (!posts) {
            return res.status(404).json({
                ok: false,
                message: "게시글을 찾을 수 없습니다.",
            });
        }

        let ret = new Array();
        
        for (let u in posts) {
            if (!forAdmin && posts[u].canceled_at)
                continue;
            let rt = new Object();
            
            rt.title = posts[u].title;
            rt.id = posts[u].post_id;
            rt.createdAt = dayjs(posts[u].created_at).format("YY-MM-DD");
            rt.updatedAt = dayjs(posts[u].updated_at).format("YY-MM-DD");
            rt.canceled_at = posts[u].canceled_at ? dayjs(posts[u].canceled_at).format("YY-MM-DD") : null;
            rt.category = posts[u].category;

            ret.push(rt);
        }

        return ret;
    }
    
    catch (error) {
        console.log(error);
    }
}

const getPost = async (postId) => {
    try {
        const [post] = await execute({
            psmt: `select * from POST where post_id = ?`,
            binding: [postId]
        });

        let user = await getUser(post[0].user_id);
        console.log("user : %j", user);

        if (!post) {
            return res.status(404).json({
                ok: false,
                message: "해당 게시글을 찾을 수 없습니다.",
            });
        }

        let post_obj = new Object();

        post_obj.title = post[0].title;
        post_obj.content = post[0].content;
        post_obj.createdAt = dayjs(post[0].created_at).format("YY-MM-DD");
        post_obj.updatedAt = dayjs(post[0].updated_at).format("YY-MM-DD");
        post_obj.user = {
            "id" : user.id,
            "name" : user.name,
            "username" : user.user_name,
            "email" : user.email,
            "type" : convertType(user.type),
        };
        post_obj.category = post[0].category;

        return post_obj;
    } catch(error) {
        return error;
    }
}

const getPostsByUserID = async (userID) => {
    try {
        const [posts] = await execute({
            psmt: `select * from POST where user_id = ?`,
            binding: [userID]
        });

        if (!posts) {
            return res.status(404).json({
                ok: false,
                message: "게시글을 찾을 수 없습니다.",
            });
        }

        let ret = new Array();
        
        for (let u in posts) {
            let rt = new Object();
            
            rt.title = posts[u].title;
            rt.id = posts[u].post_id;
            rt.category = posts[u].category;
            rt.createdAt = dayjs(posts[u].created_at).format("YY-MM-DD");

            ret.push(rt);
        }

        return ret;
    }
    
    catch (error) {
        return error;
    }
}


module.exports = {
    getConnection,
    execute,
    getUser,
    getAllUsers,
    getPost,
    getPostsByUserID,
    convertType,
    getAllPostsList,
}
