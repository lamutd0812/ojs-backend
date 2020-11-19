const express = require('express');
const { USER_ROLES } = require('../config/constant');
const decisionController = require('../controller/decision');
const { checkAuth, restrict } = require('../middlewares/check-auth');

const router = express.Router();

// 1. Editor Decisions
router.get('/editor/', decisionController.getEditorDecisions);

router.get('/editor/:chiefEditorDecisionId', decisionController.getEditorDecisionById);

router.post('/editor',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.addEditorDecision);

router.put('/editor/:chiefEditorDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.updateEditorDecision);

router.delete('/editor/:chiefEditorDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.deleteEditorDecision);

// 2. Reviewer Decisions
router.get('/reviewer/', decisionController.getReviewerDecisions);

router.get('/reviewer/:reviewerDecisionId', decisionController.getReviewerDecisionById);

router.post('/reviewer',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.addReviewerDecision);

router.put('/reviewer/:reviewerDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.updateReviewerDecision);

router.delete('/reviewer/:reviewerDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.deleteReviewerDecision);

// 3. Chief Editor Decisions
router.get('/chief-editor/', decisionController.getChiefEditorDecisions);

router.get('/chief-editor/:chiefEditorDecisionId', decisionController.getChiefEditorDecisionById);

router.post('/chief-editor',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.addChiefEditorDecision);

router.put('/chief-editor/:chiefEditorDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.updateChiefEditorDecision);

router.delete('/chief-editor/:chiefEditorDecisionId',
    checkAuth,
    restrict([USER_ROLES.ADMIN.permissionLevel]),
    decisionController.deleteChiefEditorDecision);

module.exports = router;