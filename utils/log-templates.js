
exports.authorSubmitArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã submit bài báo lên hệ thống.';
};

exports.authorUpdateArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã chỉnh sửa bài báo.';
};

exports.chiefEditorAssignEditor = (editorName) => {
    return 'Tổng biên tập đã chỉ định biên tập viên ' + editorName + ' chủ trì quá trình thẩm định.';
};