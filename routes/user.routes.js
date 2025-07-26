const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const expensesController = require('../controller/user.controller');
const protect = require('../middlewares/jwt');
const reportController = require('../controller/user.controller');


router.get('/dashboard',protect,userController.dashboard);
router.get('/expenses', protect, expensesController.expenses);
router.get('/report', protect, reportController.report);

module.exports = router;