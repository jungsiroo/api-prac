const dayjs = require("dayjs");
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

const getReturnObject = (message, status, data) => {
    return {
        "message":message,
        "status" :status,
        "servertime": dayjs().format('YYYY-MM-DD HH:MM:ss'),
        "data" : data
    }
}

const isEmpty = (value) => {
    if (value === null) return true
    if (typeof value === 'undefined') return true
    if (Array.isArray(value) && value.length < 1) return true
    if (typeof value === 'object' && value.constructor.name === 'Object' && Object.keys(value).length < 1 && Object.getOwnPropertyNames(value) < 1) return true
    if (typeof value === 'object' && value.constructor.name === 'String' && Object.keys(value).length < 1) return true 

    return false
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
    isEmpty,
    getReturnObject,
    getPost,
    getPostsByUserID,
    getAllPostsList,
}
