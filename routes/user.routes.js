const express = require('express');
const router = express.Router();
const protect = require('../middlewares/jwt');

// Controllers
const userController = require('../controller/user.controller');
const expensesController = require('../controller/user.controller');
const reportController = require('../controller/user.controller');
const budgetController = require('../controller/user.controller');
const analyticsController = require('../controller/user.controller');
const incomeController = require('../controller/user.controller');
const { exportCSV, exportPDF } = require('../controller/user.controller');


// Dashboard
router.get('/dashboard', protect, userController.getDashboard);

// Expenses
router.get('/expenses', protect, expensesController.getAllExpenses);  
router.post('/expenses', protect, expensesController.addExpense);
router.delete('/expenses/:id', protect, expensesController.deleteExpense);
router.post('/expenses/:id', protect, expensesController.updateExpense);

// Reports
router.get('/report', protect, reportController.report);
router.get("/reports/export/csv", protect, exportCSV);
router.get("/reports/export/pdf", protect, exportPDF);

// Budget
router.get('/budget', protect, budgetController.getBudgetPage);
router.post('/budget', protect, budgetController.budget);
router.delete('/budget/:id', protect, budgetController.deleteBudget);

// Analytics
router.get('/analytics', protect, analyticsController.analytics);

// Income
router.get('/income', protect, incomeController.getIncomePage);
router.post('/income/add', protect, incomeController.addIncome);
router.delete('/income/:id', protect, incomeController.deleteIncome);

// Home Page
router.get('/', userController.getHome);

module.exports = router;
