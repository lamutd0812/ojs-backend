
exports.authorSubmitArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã submit bài báo lên hệ thống.';
};


exports.authorUpdateArticle = () => {
    return 'Tác giả đã chỉnh sửa bài báo.';
};

exports.chiefEditorAssignEditor = () => {
    return 'Biên tập viên đã được chỉ định.';
};

// exports.editorAssignReviewer = (reviewerName) => {
//     return 'Biên tập viên đã chỉ định thẩm định viên ' + reviewerName + ' thẩm định bài báo.';
// };

exports.submissionHasFullReviewer = () => {
    return 'Thẩm định viên đã được chỉ định đủ.';
};

exports.reviewerCreateReview = (reviewerName) => {
    return 'Thẩm định viên ' + reviewerName + ' đã gửi ý kiến thẩm định bài báo.';
}

exports.editorSubmitReview = () => {
    return 'Biên tập viên đã nộp kết quả thẩm định bài báo.';
}

exports.editorRequestAuthorRevision = () => {
    return 'Biên tập viên đã yêu cầu tác giả chỉnh sửa bài báo.';
};

exports.authorSubmitRevision = () => {
    return 'Tác giả đã nộp bản chỉnh sửa bài báo.';
};

exports.chiefEditorAcceptSubmission = () => {
    return 'Bài báo đã được chấp nhận xuất bản.';
}

exports.chiefEditorDeclineSubmission = () => {
    return 'Tổng biên tâp đã từ chối bài báo.';
}