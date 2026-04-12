'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

const router = Router();
router.use(authMiddleware);

router.get('/health',        ctrl.getHealthScores);
router.get('/conflicts',     ctrl.getConflicts);
router.get('/relationships', ctrl.getRelationships);
router.get('/suggestions',   ctrl.getSuggestedRules);
router.get('/stats',         ctrl.getEnhancedStats);

module.exports = router;
