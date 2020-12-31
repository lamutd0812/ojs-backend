const SubmisisonType = require('../model/submission_type');
const { StatusCodes } = require('http-status-codes');

exports.getAllTypess = async (req, res) => {
    try {
        const types = await SubmisisonType.find();
        res.status(StatusCodes.OK).json({ types: types });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.getTypeById = async (req, res) => {
    const typeId = req.params.categoryId;
    try {
        const category = await SubmisisonType.findById(typeId);
        res.status(StatusCodes.OK).json({
            type: type
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.addType = async (req, res) => {
    try {
        const type = new SubmisisonType(req.body);
        const newType = await type.save();
        res.status(StatusCodes.CREATED).json({ type: newType });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.updateType = async (req, res) => {
    const typeId = req.params.typeId;
    try {
        const updatedType = await SubmisisonType.findByIdAndUpdate(typeId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ type: updatedType });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.deleteType = async (req, res) => {
    const typeId = req.params.typeId;
    try {
        const deletedType = await SubmisisonType.findByIdAndDelete(typeId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted category',
            typeId: deletedType._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};



