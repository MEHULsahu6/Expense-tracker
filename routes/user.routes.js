const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const expensesController = require('../controller/user.controller');
const protect = require('../middlewares/jwt');
const reportController = require('../controller/user.controller');
const budgetController = require('../controller/user.controller');
const analyticsController = require('../controller/user.controller');
const  getHome  = require('../controller/user.controller');
const incomeController = require('../controller/user.controller');


router.get('/dashboard',protect,userController.getDashboard);

router.get('/expenses', protect, expensesController.getAllExpenses);  
router.post('/expenses', protect, expensesController.addExpense);
router.delete('/expenses/:id', protect, expensesController.deleteExpense);
router.post('/expenses/:id', protect, expensesController.updateExpense);





router.get('/report', protect, reportController.report);





router.get('/budget', protect, budgetController.getBudgetPage);

router.post('/budget', protect, budgetController.budget);








// Assuming budget can also be posted to
router.get('/analytics', protect, analyticsController.analytics);

router.get('/income', protect, incomeController.getIncomePage);
router.post('/income/add', protect, incomeController.addIncome);
router.delete('/income/:id', protect, incomeController.deleteIncome);

router.get('/', userController.getHome);

module.exports = router;