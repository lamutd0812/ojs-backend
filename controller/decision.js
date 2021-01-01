const EditorDecision = require('../model/editor_decision');
const ReviewerDecision = require('../model/reviewer_decision');
const ChiefEditorDecision = require('../model/chief_editor_decision');
const { StatusCodes } = require('http-status-codes')

// 1. Editor Decisions
exports.getEditorDecisions = async (req, res) => {
    try {
        const editorDecisions = await EditorDecision.find();
        res.status(StatusCodes.OK).json({ editorDecisions: editorDecisions });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.getEditorDecisionById = async (req, res) => {
    const editorDecisionId = req.params.editorDecisionId;
    try {
        const editorDecision = await EditorDecision.findById(editorDecisionId);
        res.status(StatusCodes.OK).json({
            editorDecision: editorDecision
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.addEditorDecision = async (req, res) => {
    try {
        const editorDecision = new EditorDecision(req.body);
        const newEditorDecision = await editorDecision.save();
        res.status(StatusCodes.CREATED).json({ editorDecision: newEditorDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.updateEditorDecision = async (req, res) => {
    const editorDecisionId = req.params.editorDecisionId;
    try {
        const updatedEditorDecision = await EditorDecision.findByIdAndUpdate(editorDecisionId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ editorDecision: updatedEditorDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.deleteEditorDecision = async (req, res) => {
    const editorDecisionId = req.params.editorDecisionId;
    try {
        const deletedEditorDecision = await EditorDecision.findByIdAndDelete(editorDecisionId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted editorDecision',
            editorDecisionId: deletedEditorDecision._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

// 2. Reviewer Decisions
exports.getReviewerDecisions = async (req, res) => {
    try {
        const reviewerDecisions = await ReviewerDecision.find();
        res.status(StatusCodes.OK).json({ reviewerDecisions: reviewerDecisions });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.getReviewerDecisionById = async (req, res) => {
    const reviewerDecisionId = req.params.reviewerDecisionId;
    try {
        const reviewerDecision = await ReviewerDecision.findById(reviewerDecisionId);
        res.status(StatusCodes.OK).json({
            reviewerDecision: reviewerDecision
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.addReviewerDecision = async (req, res) => {
    try {
        const reviewerDecision = new ReviewerDecision(req.body);
        const newReviewerDecision = await reviewerDecision.save();
        res.status(StatusCodes.CREATED).json({ reviewerDecision: newReviewerDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.updateReviewerDecision = async (req, res) => {
    const reviewerDecisionId = req.params.reviewerDecisionId;
    try {
        const updatedReviewerDecision = await ReviewerDecision.findByIdAndUpdate(reviewerDecisionId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ reviewerDecision: updatedReviewerDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.deleteReviewerDecision = async (req, res) => {
    const reviewerDecisionId = req.params.reviewerDecisionId;
    try {
        const deletedReviewerDecision = await ReviewerDecision.findByIdAndDelete(reviewerDecisionId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted editorDecision',
            reviewerDecisionId: deletedReviewerDecision._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

// 3. ChiefEditor Decisions
exports.getChiefEditorDecisions = async (req, res) => {
    try {
        const chiefEditorDecisions = await ChiefEditorDecision.find();
        res.status(StatusCodes.OK).json({ chiefEditorDecisions: chiefEditorDecisions });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.getChiefEditorDecisionById = async (req, res) => {
    const chiefEditorDecisionId = req.params.chiefEditorDecisionId;
    try {
        const chiefEditorDecision = await ChiefEditorDecision.findById(chiefEditorDecisionId);
        res.status(StatusCodes.OK).json({
            chiefEditorDecision: chiefEditorDecision
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.addChiefEditorDecision = async (req, res) => {
    try {
        const chiefEditorDecision = new ChiefEditorDecision(req.body);
        const newChiefEditorDecision = await chiefEditorDecision.save();
        res.status(StatusCodes.CREATED).json({ chiefEditorDecision: newChiefEditorDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.updateChiefEditorDecision = async (req, res) => {
    const chiefEditorDecisionId = req.params.chiefEditorDecisionId;
    try {
        const updatedChiefEditorDecision = await ChiefEditorDecision.findByIdAndUpdate(chiefEditorDecisionId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ chiefEditorDecision: updatedChiefEditorDecision });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.deleteChiefEditorDecision = async (req, res) => {
    const chiefEditorDecisionId = req.params.chiefEditorDecisionId;
    try {
        const deletedChiefEditorDecision = await ChiefEditorDecision.findByIdAndDelete(chiefEditorDecisionId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted ChiefEditorDecision',
            chiefEditorDecisionId: deletedChiefEditorDecision._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};



