const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send('Unauthorized');
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).send('Unauthorized');
  }
}

router.use(authMiddleware);

router.get('/logs', dashboardCtrl.getLogs);
router.get('/stats', dashboardCtrl.getStats);

module.exports = router;
