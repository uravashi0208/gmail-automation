'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/aiController');

const router = Router();
router.use(authMiddleware);

router.get('/priority',      ctrl.getPriorityScores);
router.get('/digest',        ctrl.getDailyDigest);
router.get('/optimize',      ctrl.getOptimizationTips);
router.get('/bulk-preview',  ctrl.getBulkLabelPreview);
router.get('/sender/:email', ctrl.getSenderIntelligence);
router.get('/live',          ctrl.getLiveStats);
router.post('/run-now',      ctrl.runNow);

module.exports = router;
