const Article = require('../model/article');
const Submission = require('../model/submission');
const { StatusCodes } = require('http-status-codes');

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
                    { path: 'categoryId', select: 'name -_id' },
                    { path: 'authorId', select: 'firstname lastname' }
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
            error: err
        });
    }
};

exports.getArticleById = async (req, res) => {
    const id = req.params.id;
    try {
        const article = await Article
            .findById(id)
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'categoryId', select: 'name -_id' },
                    { path: 'authorId', select: 'firstname lastname biography avatar' }
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

exports.getSubmissionsByKeyword = async (req, res) => {
    // const keyword = req.query.keyword;
    const regex = new RegExp(req.query["keyword"], 'i');
    try {
        const submissions = await Submission
            .find({ title: regex }, { title: 1 })
            .limit(20)
            .select("title")
            .exec();
        // const submissions = await Submission
        //     .find({ $text: { $search: keyword } })
        //     .limit(20)
        //     .select("title")
        //     .exec();
        res.status(StatusCodes.OK).json({ submissions: submissions });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};

exports.getArticleBySubmisison = async (req, res) => {
    const submissionId = req.params.submissionId;
    try {
        const article = await Article
            .findOne({ submissionId: submissionId })
            .populate({
                path: 'submissionId',
                select: '-stageId -submissionLogs',
                populate: [
                    { path: 'categoryId', select: 'name -_id' },
                    { path: 'authorId', select: 'firstname lastname biography avatar' }
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
            error: err
        });
    }
};