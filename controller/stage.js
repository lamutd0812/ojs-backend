const Stage = require('../model/stage');

exports.getAllStages = async (req, res) => {
    try {
        const stages = await Stage.find();
        res.status(200).json({ stages: stages });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.getStageById = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const stage = await Stage.findById(stageId);
        res.status(200).json({
            stage: stage
        })
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.addStage = async (req, res) => {
    try {
        const stage = new Stage(req.body);
        const newStage = await stage.save();
        res.status(200).json({ stage: newStage });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.updateStage = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const updatedStage = await Stage.findByIdAndUpdate(stageId, req.body, { new: true });
        res.status(200).json({ stage: updatedStage });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};

exports.deleteStage = async (req, res) => {
    const stageId = req.params.stageId;
    try {
        const deletedStage = await Stage.findByIdAndDelete(stageId);
        res.status(200).json({
            message: 'Deleted Stage',
            stageId: deletedStage._id
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};



