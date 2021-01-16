const express = require('express');
const articleController = require('../controller/article');
const { checkAuth } = require('../middlewares/check-auth');

const router = express.Router();

// Get All Articles
router.get('/', articleController.getAllArticles);

// Get Most Viewed Articles
router.get('/most-viewed', articleController.getMostViewedArticles);

// Get Most Downloaded Articles
router.get('/most-downloaded', articleController.getMostDownloadedArticles);

// Get Article by Id
router.get('/:articleId', articleController.getArticleById);

// Get Related Article by articleId
router.get('/realated/:articleId', articleController.getRelatedArticles);

// Update Article downloaded times
router.put('/update-downloaded-count/:articleId', articleController.updateDownloadedTimes);

// Search Submisison By Keyword
router.get('/search/all', articleController.getArticlesByKeyword);

// Create Comment of an Article
router.post('/comments/:articleId',
    checkAuth,
    articleController.createComment);

// Create Reply of an Comment
router.post('/replies/:commentId',
    checkAuth,
    articleController.createReplyOfComment);

router.get('/comments/:articleId', articleController.getCommentsOfArticle);

module.exports = router;