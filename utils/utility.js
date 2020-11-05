exports.getFileNameFromUrl = (url) => {
    return url.replace(/^.*[\\\/]/, "");
}