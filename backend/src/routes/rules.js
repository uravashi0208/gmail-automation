'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const rulesController = require('../controllers/rulesController');

const router = Router();
router.use(authMiddleware);

router.get('/',               rulesController.list);
router.post('/',              rulesController.create);
router.put('/:id',            rulesController.update);
router.delete('/:id',         rulesController.remove);
router.post('/bulk/active',   rulesController.bulkSetActive);
router.post('/bulk/delete',   rulesController.bulkDelete);
router.post('/:id/duplicate', rulesController.duplicate);

module.exports = router;
