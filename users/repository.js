const DB = require("../common/database");
const MSG = require("../common/message");
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

const getAllUsers = async (forAdmin=false) => {
    try {
        const [users] = await DB.execute({
            psmt: `select * from USER`,
            binding: []
        });

        if (DB.isEmpty(users)) {
            return DB.getReturnObject(MSG.CANT_READ_USERDATA, 404, null)
        }

        let ret = new Array();

        for (let u in users) {
            let rt = new Object();
            if (!forAdmin && users[u].canceled_at)
                continue;

            rt.user_id = users[u].user_id; // 아이디 
            rt.username = users[u].username; // 유저네임
            rt.email = users[u].email; // 이메일
            rt.student_id = users[u].student_id; //학번
            rt.generation = users[u].generation;
            rt.company = users[u].company ? users[u].company : "-";
            rt.github = users[u].github ? users[u].github : "-";
            rt.created_at = dayjs(users[u].created_at).format("YYYY-MM-DD");
            rt.type = convertType(users[u].type)
            
            ret.push(rt);
        }

        return DB.getReturnObject(MSG.READ_USERDATA_SUCCESS, 200, ret)
    } catch (error) {
        console.log(error);
        return DB.getReturnObject(MSG.UNKNOWN_ERROR, 500, null);
    }
}

const getUser = async (userID, forAdmin=false) => {
    try {
        const [data] = await DB.execute({
            psmt: `select * from USER where user_id = ?`,
            binding: [userID]
        });

        if (DB.isEmpty(data)) {
            return DB.getReturnObject(MSG.NO_USER_DATA, 404, null)
        }

        user = data[0];
        let user_obj = new Object();

        user_obj.user_id = userID;
        user_obj.username = user.username;
        user_obj.email = user.email;
        user_obj.student_id = user.student_id;
        user_obj.type = convertType(user.type);
        user_obj.company = user.company ? user.company : "-";
        user_obj.generation = user.generation;
        user_obj.github = user.github ? user.github : "-";
        user_obj.created_at = dayjs(user.created_at).format("YYYY-MM-DD");
        if (forAdmin)
            user_obj.canceled_at = user.canceled_at;


        return DB.getReturnObject(user.username+MSG.READ_USER_SUCCESS, 200, user_obj);
    } catch (error) {
        console.log(error);
        return DB.getReturnObject(MSG.UNKNOWN_ERROR, 500, null);
    }
}

const editUser = async (userID, column, new_info) => {
    try {
        await DB.execute({
            psmt : `update USER SET ${column}=?, updated_at = NOW() where user_id = ?`,
            binding : [new_info, userID]
        });

        return DB.getReturnObject(MSG.USER_UPDATE_SUCCESS, 400, null);
    } catch (error) {
        console.log(error);
        return DB.getReturnObject(MSG.UNKNOWN_ERROR, 500, null);
    }
}

module.exports = {
    getUser,
    getAllUsers,
    editUser
}
