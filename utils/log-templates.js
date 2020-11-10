
exports.authorSubmitArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã submit bài báo lên hệ thống.';
};

exports.authorUpdateArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã chỉnh sửa bài báo.';
};

exports.chiefEditorAssignEditor = (editorName) => {
    return 'Tổng biên tập đã chỉ định biên tập viên ' + editorName + ' chủ trì quá trình thẩm định.';
};

exports.editorAssignReviewer = (reviewerName) => {
    return 'Biên tập viên đã chỉ định thẩm định viên ' + reviewerName + ' thẩm định bài báo.';
};