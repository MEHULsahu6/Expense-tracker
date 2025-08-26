const Expense = require('../models/expense');
const Income = require('../models/Income');

async function getTotalExpenseAndIncome(userId) {
  const expenses = await Expense.find({ userId });
  const incomes = await Income.find({ userId });

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  return { totalExpense, totalIncome };
}

module.exports = getTotalExpenseAndIncome;
