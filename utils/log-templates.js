
exports.authorSubmitArticle = (authorName) => {
    return 'Tác giả ' + authorName + ' đã submit bài báo lên hệ thống.'
};

exports.chiefEditorAssignEditor = (chiefEditorName, editorName) => {
    return chiefEditorName + ' đã chỉ định biên tập viên ' + editorName + ' chủ trì quá trình thẩm định';
};