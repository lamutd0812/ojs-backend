const e = require("express");

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
        decisionName: 'Chấp nhận xuất bản',
        value: 1
    },
    DECLINE_SUBMISSION: {
        decisionName: 'Từ chối bài báo',
        value: 0
    }
}

exports.EDITOR_DECISION = {
    ACCEPT_SUBMISSION: {
        decisionName: 'Chấp nhận bài báo',
        value: 1
    },
    REVISION_REQUIRED: {
        decisionName: 'Yêu cầu chỉnh sửa',
        value: 2
    },
    UNSENT: {
        decisionName: 'Chưa nộp ý kiến',
        value: 0
    }
}

exports.REVIEWER_DECISION = {
    ACCEPT_SUBMISSION: {
        decisionName: 'Chấp nhận bài báo',
        value: 1
    },
    REVISION_REQUIRED: {
        decisionName: 'Yêu cầu chỉnh sửa',
        value: 2
    },
    UNSENT: {
        decisionName: 'Chưa nộp ý kiến',
        value: 0
    }
}

// exports.SUBMISSION_STATUS = {
//     AUTHOR_SUBMIT_SUCCESS: 'Đăng bài lên hệ thống thành công.',
//     ASSIGN_EDITOR_SUCCESS: 'Biên tập viên đã được chỉ định.',
//     ASSIGN_REVIEWERS_SUCCESS: 'Thẩm định viên đã được chỉ định đủ.',
//     REVIEWERS_COMPLETED_REVIEW: 'Tất cả thẩm định viên đã nộp ý kiến thâm định.',
//     EDITOR_REQUEST_REVISION: ' Biên tập viên đã yêu cầu tác giả chỉnh sửa bài báo.',
//     EDITOR_SUBMIT_REVIEW: 'Biên tập viên đã nộp ý kiến thẩm định.',
//     CHIEF_EDITOR_ACCEPTED_SUBMISSION: 'Tổng biên tập đã chấp nhận bài báo.',
//     CHIEF_EDITOR_DECLINE_SUBMISSION: 'Tổng biên tập đã từ chối bài báo.',
//     REVIEW_IN_PROCESS: 'Quá trình thẩm định đang diễn ra',
// };

exports.NOTIFICATION_TYPE = {
    AUTHOR_TO_CHIEF_EDITOR: 'AUTHOR_TO_CHIEF_EDITOR', // Author Submit Article
    CHIEF_EDITOR_TO_EDITOR: 'CHIEF_EDITOR_TO_EDITOR', // CE Assign Editor
    EDITOR_TO_REVIEWER: 'EDITOR_TO_REVIEWER', // Editor Assign Reviewer
    REVIEWER_TO_EDITOR: 'REVIEWER_TO_EDITOR', // Reviewer Submit Review
    EDITOR_TO_CHIEF_EDITOR: 'EDITOR_TO_CHIEF_EDITOR',// Editor Submit Review
    EDITOR_TO_AUTHOR: 'EDITOR_TO_AUTHOR', // Editor Request Author Revision
    AUTHOR_TO_EDITOR: 'AUTHOR_TO_EDITOR', // Author Submit Revision
    CHIEF_EDITOR_TO_AUTHOR: 'CHIEF_EDITOR_TO_AUTHOR', // CE notify decision to Author,
    CHIEF_EDITOR_TO_OTHERS: 'CHIEF_EDITOR_TO_OTHERS'
}

// exports.ITEMS_PER_PAGE = 4;
