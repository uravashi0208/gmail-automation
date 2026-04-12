'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const rulesController = require('../controllers/rulesController');

const router = Router();

router.use(authMiddleware);

router.get('/', rulesController.list);
router.post('/', rulesController.create);
router.put('/:id', rulesController.update);
router.delete('/:id', rulesController.remove);

module.exports = router;
