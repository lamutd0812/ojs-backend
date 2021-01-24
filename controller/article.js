const Article = require('../model/article');
const { StatusCodes } = require('http-status-codes');
const Comment = require('../model/comment');
const Reply = require('../model/reply');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const article = require('../model/article');

exports.getAllArticles = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    //filter
    const categoryId = req.query.categoryId || "";
    const typeId = req.query.typeId || "";

    try {
        let total = await Article.countDocuments();
        let articles = await Article
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
            // .skip((page - 1) * ITEMS_PER_PAGE)
            // .limit(ITEMS_PER_PAGE)
            .sort({ _id: -1 })
            .exec();

        const skip = (page - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        if (typeId === "" && categoryId === "") {
            articles = articles.slice(skip, skip + limit + 1);
        } else {
            let filter = [];
            if (typeId !== "" && categoryId !== "") {
                filter = articles.filter(a => a.submissionId.typeId._id.toString() === typeId
                    && a.submissionId.categoryId._id.toString() === categoryId);
            } else {
                if (typeId !== "") {
                    filter = articles.filter(a => a.submissionId.typeId._id.toString() === typeId);
                }
                if (categoryId !== "") {
                    filter = articles.filter(a => a.submissionId.categoryId._id.toString() === categoryId);
                }
            }

            total = filter.length;
            articles = filter.slice(skip, skip + limit + 1);
        }

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

// exports.getAllArticles = async (req, res) => {
//     const page = +req.query.page || 1;
//     const ITEMS_PER_PAGE = +req.query.limit || 8;
//     //filter
//     const categoryId = req.query.categoryId || "";
//     const typeId = req.query.typeId || "";

//     try {
//         let total = await Article.countDocuments();
//         let articles = await Article
//             .find()
//             .populate({
//                 path: 'submissionId',
//                 select: '-stageId -submissionLogs',
//                 populate: [
//                     { path: 'authorId', select: 'firstname lastname biography avatar' },
//                     { path: 'categoryId', select: 'name' },
//                     { path: 'typeId', select: 'name' }
//                 ]
//             })
//             .skip((page - 1) * ITEMS_PER_PAGE)
//             .limit(ITEMS_PER_PAGE)
//             .sort({ _id: -1 })
//             .exec();

//         if (typeId !== "") {
//             articles = articles.filter(a => a.submissionId.typeId._id.toString() === typeId);
//         }
//         if (categoryId !== "") {
//             articles = articles.filter(a => a.submissionId.categoryId._id.toString() === categoryId);
//         }

//         res.status(StatusCodes.OK).json({
//             articles: articles,
//             total: total,
//             currentPage: page
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             error: "Internal Server Error."
//         });
//     }
// };

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
            message: "Bình luận thành công!",
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
            message: "Trả lời bình luận thành công!",
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
                    let: { cmtId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$commentId", "$$cmtId"]
                                }
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
                        }
                    ],
                    as: "replies"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "content": 1,
                    "articleId": 1,
                    "createdAt": 1,
                    "user._id": 1,
                    "user.firstname": 1,
                    "user.lastname": 1,
                    "user.avatar": 1,
                    "replies._id": 1,
                    "replies.content": 1,
                    "replies.commentId": 1,
                    "replies.createdAt": 1,
                    "replies.user.firstname": 1,
                    "replies.user.lastname": 1,
                    "replies.user.avatar": 1,
                }
            },
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

exports.getMyArticles = async (req, res) => {
    const userId = req.user.userId;
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const articles = await Article.aggregate([
            {
                $lookup: {
                    from: "submissions",
                    localField: "submissionId",
                    foreignField: "_id",
                    as: "submission"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "publishedDate": 1,
                    "views": 1,
                    "downloaded": 1,
                    "title": 1,
                    "submission._id": 1,
                    "submission.categoryId": 1,
                    "submission.abstract": 1,
                    "submission.authorId": 1,
                    "submission.title": 1,
                    "submission.attachmentFile": 1,
                    "submission.attachmentUrl": 1,
                    "submission.typeId": 1,
                }
            },
            {
                $unwind: "$submission"
            },
            {
                $match: {
                    "submission.authorId": mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "submission.categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $lookup: {
                    from: "submission_types",
                    localField: "submission.typeId",
                    foreignField: "_id",
                    as: "type"
                }
            },
            {
                $unwind: "$type"
            },
            {
                $sort: { views: -1 },
            },
            {
                $skip: (page - 1) * ITEMS_PER_PAGE,
            },
            {
                $limit: ITEMS_PER_PAGE,
            },
        ]);

        res.status(StatusCodes.OK).json({
            articles: articles,
            total: articles.length,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};
