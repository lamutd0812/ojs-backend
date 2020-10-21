exports.USER_ROLES = {
    ADMIN: {
        name: 'Admin',
        value: 0
    },
    CHIEF_EDITOR: {
        name: 'Chief Editor',
        value: 1
    },
    EDITOR: {
        name: 'Editor',
        value: 2
    },
    REVIEWER: {
        name: 'Reviewer',
        value: 3
    },
    AUTHOR: {
        name: 'Author',
        value: 4
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