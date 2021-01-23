const Category = require('../model/category');
const { StatusCodes } = require('http-status-codes');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().select('name');
        res.status(StatusCodes.OK).json({ categories: categories });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.getCategoryById = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const category = await Category.findById(categoryId);
        res.status(StatusCodes.OK).json({
            category: category
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.addCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        const newcategory = await category.save();
        res.status(StatusCodes.CREATED).json({ category: newcategory });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.updateCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ category: updatedCategory });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted category',
            categoryId: deletedCategory._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};



