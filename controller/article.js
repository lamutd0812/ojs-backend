const Article = require('../model/article');
const { StatusCodes } = require('http-status-codes');
const Comment = require('../model/comment');
const Reply = require('../model/reply');
const mongoose = require('mongoose');

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
                    { path: 'categoryId', select: 'name' },
                    { path: 'typeId', select: 'name' }
                ]
            })
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
            error: "Internal Server Error."
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
                    { path: 'categoryId', select: 'name' },
                    { path: 'typeId', select: 'name' }
                ]
            })
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
            error: "Internal Server Error."
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
                    { path: 'categoryId', select: 'name' },
                    { path: 'typeId', select: 'name' }
                ]
            })
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
            error: "Internal Server Error."
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
                    { path: 'categoryId', select: 'name' },
                    { path: 'typeId', select: 'name' }
                ]
            })
            .exec();

        res.status(StatusCodes.OK).json({
            article: article,
        });
        article.views = article.views + 1;
        await article.save();
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
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
                    { path: 'categoryId', select: 'name' },
                    { path: 'typeId', select: 'name' }
                ]
            })
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
            error: "Internal Server Error."
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
            error: "Internal Server Error."
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
            error: "Internal Server Error."
        });
    }
};

exports.createComment = async (req, res) => {
    const content = req.body.content;
    const articleId = req.params.articleId;
    const userId = req.user.userId;
    try {
        const comment = new Comment({
            content,
            articleId,
            userId
        });
        const newComment = await comment.save();
        res.status(StatusCodes.CREATED).json({
            comment: newComment
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.createReplyOfComment = async (req, res) => {
    const content = req.body.content;
    const commentId = req.params.commentId;
    const userId = req.user.userId;
    try {
        const reply = new Reply({
            content,
            commentId,
            userId
        });
        const newReply = await reply.save();
        res.status(StatusCodes.CREATED).json({
            reply: newReply
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getCommentsOfArticle = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const comments = await Comment.aggregate([
            {
                $match: {
                    articleId: mongoose.Types.ObjectId(articleId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: "replies",
                    localField: "_id",
                    foreignField: "commentId",
                    as: "replies"
                }
            }
        ]);
        res.status(StatusCodes.OK).json({
            comments: comments
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};
