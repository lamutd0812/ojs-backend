const Article = require('../model/article');
const Submission = require('../model/submission');
const { StatusCodes } = require('http-status-codes');
const bluebird = require('bluebird');

exports.getAllArticles = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await Article.countDocuments();
        const articles = await Article
            .find()
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'authorId', select: 'firstname lastname biography avatar' },
                    { path: 'categoryId', select: 'name' }
                ]
            })
            .populate('categoryId', 'name -_id')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();

        res.status(StatusCodes.OK).json({
            articles: articles,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getMostViewedArticles = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await Article.countDocuments();
        const articles = await Article
            .find()
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'authorId', select: 'firstname lastname biography avatar' },
                    { path: 'categoryId', select: 'name' }
                ]
            })
            .populate('categoryId', 'name -_id')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ views: -1 })
            .exec();

        res.status(StatusCodes.OK).json({
            articles: articles,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getMostDownloadedArticles = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await Article.countDocuments();
        const articles = await Article
            .find()
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'authorId', select: 'firstname lastname biography avatar' },
                    { path: 'categoryId', select: 'name' }
                ]
            })
            .populate('categoryId', 'name -_id')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ downloaded: -1 })
            .exec();

        res.status(StatusCodes.OK).json({
            articles: articles,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getArticleById = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const article = await Article
            .findById(articleId)
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'authorId', select: 'firstname lastname biography avatar' },
                    { path: 'categoryId', select: 'name' }
                ]
            })
            .populate('categoryId', 'name -_id')
            .exec();

        res.status(StatusCodes.OK).json({
            article: article,
        });
        article.views = article.views + 1;
        await article.save();
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getRelatedArticles = async (req, res) => {
    const articleId = req.params.articleId;
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const article = await Article.findById(articleId);
        const cond = {
            _id: { $ne: article._id },
            categoryId: article.categoryId
        };
        const total = await Article.countDocuments(cond);
        const relatedArticles = await Article
            .find(cond)
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'authorId', select: 'firstname lastname biography avatar' },
                    { path: 'categoryId', select: 'name' }
                ]
            })
            .populate('categoryId', 'name -_id')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ downloaded: -1 })
            .exec();

        res.status(StatusCodes.OK).json({
            relatedArticles: relatedArticles,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.updateDownloadedTimes = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const article = await Article.findById(articleId);
        article.downloaded += 1;
        const updatedArticle = await article.save();
        res.status(StatusCodes.OK).json({
            articleId: updatedArticle._id,
            downloaded: updatedArticle.downloaded
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getArticlesByKeyword = async (req, res) => {
    const regex = new RegExp(req.query["keyword"], 'i');
    try {
        const articles = await Article
            .find({ title: regex }, { title: 1 })
            .limit(20)
            .select("title")
            .exec();
        // const articles = await Article
        //     .find({ $text: { $search: keyword } })
        //     .limit(20)
        //     .select("title")
        //     .exec();
        res.status(StatusCodes.OK).json({ articles: articles });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};
