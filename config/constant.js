exports.USER_ROLES = {
    ADMIN: {
        name: 'Admin',
        permissionLevel: 5
    },
    CHIEF_EDITOR: {
        name: 'Tổng biên tập',
        permissionLevel: 4
    },
    EDITOR: {
        name: 'Biên tập viên',
        permissionLevel: 3
    },
    REVIEWER: {
        name: 'Thẩm định viên',
        permissionLevel: 2
    },
    AUTHOR: {
        name: 'Tác giả',
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

exports.CHIEF_EDITOR_DECISION = {
    ACCEPT_SUBMISSION: {
        decisionName: 'Chấp nhận bài báo.',
        value: 1
    },
    DECLINE_SUBMISSION: {
        decisionName: 'Từ chối bài báo.',
        value: 0
    }
}

exports.EDITOR_DECISION = {
    ACCEPT_SUBMISSION: {
        decisionName: 'Chấp nhận bài báo.',
        value: 1
    },
    REVISION_REQUIRED: {
        decisionName: 'Yêu cầu chỉnh sửa.',
        value: 2
    }
}

exports.REVIEWER_DECISION = {
    ACCEPT_SUBMISSION: {
        decisionName: 'Chấp nhận bài báo.',
        value: 1
    },
    REVISION_REQUIRED: {
        decisionName: 'Yêu cầu chỉnh sửa.',
        value: 2
    }
}

exports.SUBMISSION_STATUS = {
    AUTHOR_SUBMIT_SUCCESS: 'Đăng bài lên hệ thống thành công.',
    ASSIGN_EDITOR_SUCCESS: 'Biên tập viên đã được chỉ định.',
    ASSIGN_REVIEWER_SUCCESS: 'Thẩm định viên đã được chỉ định.',
    REVIEW_IN_PROCESS: 'Quá trình thẩm định đang diễn ra',
};