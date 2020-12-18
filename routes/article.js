const express = require('express');
const articleController = require('../controller/article');

const router = express.Router();

// Get All Articles
router.get('/', articleController.getAllArticles);

// Get Article by Id
router.get('/:id', articleController.getArticleById);

// Update Article downloaded times
router.put('/update-downloaded-count/:articleId', articleController.updateDownloadedTimes);

// Search Submisison By Keyword
router.get('/search/all', articleController.getArticlesByKeyword);

module.exports = router;