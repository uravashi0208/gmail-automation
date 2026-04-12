'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

router.use(authMiddleware);

router.get('/logs', dashboardController.getLogs);
router.get('/stats', dashboardController.getStats);

module.exports = router;
