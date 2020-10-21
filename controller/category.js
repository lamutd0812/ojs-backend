const Category = require('../model/category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ categories: categories });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.getCategoryById = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const category = await Category.findById(categoryId);
        res.status(200).json({
            category: category
        })
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.addCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        const newcategory = await category.save();
        res.status(200).json({ category: newcategory });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.updateCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true });
        res.status(200).json({ category: updatedCategory });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        res.status(200).json({
            message: 'Deleted category',
            categoryId: deletedCategory._id
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};



