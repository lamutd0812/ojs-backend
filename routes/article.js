const express = require('express');
const articleController = require('../controller/article');

const router = express.Router();

// Get All Articles
router.get('/', articleController.getAllArticles);

// Get Article by Id
router.get('/:id', articleController.getArticleById);

module.exports = router;