const dayjs = require("dayjs");

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

const convertType = (type) => {
    if (!type) return "비회원";

    switch (type) {
        case "admin": return "관리자";
        case "member": return "회원";
        default: return "unknown";
    }
}

const convertToDBKey = (key) => {
    switch (key) {
        case "userId" : return "user_id";
        case "postId" : return "post_id";
        case "userName" : return "username";
        case "studentId" : return "student_id";
        case "createdAt" : return "created_at";
        case "updatedAt" : return "updated_at";
        case "canceledAt" : return "canceled_at";
        default : return key;
    }
}

module.exports = {
    getReturnObject,
    isEmpty,
    convertType,
    convertToDBKey
}