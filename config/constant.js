exports.USER_ROLES = {
    ADMIN: {
        name: 'Admin',
        permissionLevel: 5
    },
    CHIEF_EDITOR: {
        name: 'Chief Editor',
        permissionLevel: 4
    },
    EDITOR: {
        name: 'Editor',
        permissionLevel: 3
    },
    REVIEWER: {
        name: 'Reviewer',
        permissionLevel: 2
    },
    AUTHOR: {
        name: 'Author',
        permissionLevel: 1
    }
};

exports.STAGE = {
    SUBMISSION: {
        name: 'Chờ thẩm định',
        value: 1
    },
    REVIEW: {
        name: 'Thẩm định',
        value: 2
    },
    PRE_PUBLISHING: {
        name: 'Tiền xuất bản',
        value: 3
    },
    PUBLISHED: {
        name: 'Xuất bản',
        value: 4
    }
};

exports.SUBMISSION_STATUS = {
    AUTHOR_SUBMIT_SUCCESS: 'Đăng bài lên hệ thống thành công.'
};