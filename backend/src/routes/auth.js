const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const authController = require('../controllers/authController');

router.get('/google/url', authController.getAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authController.getCurrentUser); // simple route to fetch user info by token

module.exports = router;
