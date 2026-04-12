'use strict';

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/google/url', authController.getAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authController.getCurrentUser);

module.exports = router;
