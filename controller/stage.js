const Stage = require('../model/stage');
const { StatusCodes } = require('http-status-codes');

exports.getAllStages = async (req, res) => {
    try {
        const stages = await Stage.find();
        res.status(StatusCodes.OK).json({ stages: stages });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.getStageById = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const stage = await Stage.findById(stageId);
        res.status(StatusCodes.OK).json({
            stage: stage
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.addStage = async (req, res) => {
    try {
        const stage = new Stage(req.body);
        const newStage = await stage.save();
        res.status(StatusCodes.CREATED).json({ stage: newStage });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
}

exports.updateStage = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const updatedStage = await Stage.findByIdAndUpdate(stageId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ stage: updatedStage });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.deleteStage = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const deletedStage = await Stage.findByIdAndDelete(stageId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted Stage',
            stageId: deletedStage._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};



