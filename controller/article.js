const Article = require('../model/article');
const { StatusCodes } = require('http-status-codes');

const ITEMS_PER_PAGE = 4;

exports.getAllArticles = async (req, res) => {
    const page = +req.query.page || 1;
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
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};