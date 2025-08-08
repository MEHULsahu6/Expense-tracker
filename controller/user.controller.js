const jwt = require('jsonwebtoken');
const budgetScema = require('../models/budget');
const Expense = require('../models/expense');
const Income = require('../models/Income');

// Home Page
exports.getHome = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.render('home', { user: null });

    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.render('home', { user });
  } catch (error) {
    console.error('Error in getHome:', error);
    res.render('home', { user: null });
  }
};

// Dashboard Page
exports.getDashboard = async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  try {
    const user = req.user;

    const totalExpense = await Expense.find({ userId: user._id })
      .then(expenses => expenses.reduce((acc, expense) => acc + expense.amount, 0));

    const totalIncome = await Income.find({ userId: user._id })
      .then(incomes => incomes.reduce((acc, income) => acc + income.amount, 0));

    res.render('dashboard/dashboard', {
      user,
      totalExpense,
      totalIncome
    });
  } catch (error) {
    console.error("GET Dashboard Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Reports Page
exports.report = (req, res) => {
  res.render('report/report', { user: req.user });
};

// Analytics Page
exports.analytics = (req, res) => {
  res.render('analytics/analytics', { user: req.user });
};

// ====================== Budget =========================
exports.getBudgetPage = async (req, res) => {
  try {
    const budgets = await budgetScema.find({ userId: req.user._id });

    res.render("budget/budget", {
      user: req.user,
      budgets,
      message: null,
    });
  } catch (error) {
    console.error("GET Budget Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.budget = async (req, res) => {
  try {
    let { category, amount, customCategory } = req.body;

    if (category === "custom" && customCategory.trim() !== "") {
      category = customCategory.trim();
    }

    if (!category || !amount) {
      return res.status(400).send('Category and amount are required');
    }

    await budgetScema.create({
      userId: req.user._id,
      category,
      amount,
      remaining: amount,
      spent: 0
    });

    const budgets = await budgetScema.find({ userId: req.user._id });

    res.render("budget/budget", {
      user: req.user,
      budgets,
      message: "Budget saved successfully!"
    });

  } catch (error) {
    console.error('Error in budget:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ====================== Expense =========================
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.render('expenses/expenses', { expenses, user: req.user });
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).send('Server Error');
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).send('All fields are required');
    }

    const newExpense = new Expense({
      title,
      amount,
      category,
      date,
      userId: req.user._id,
    });

    await newExpense.save();
    res.redirect('/expenses');

  } catch (error) {
    console.error('Error saving expense:', error.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send('Expense ID is required');

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return res.status(404).send('Expense not found');

    res.redirect('/expenses');
  } catch (error) {
    console.error('Error deleting expense:', error.message);
    res.status(500).send('Server Error');
  }
};

exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  try {
    if (!id) return res.status(400).send('Expense ID is required');

    const updatedExpense = await Expense.findByIdAndUpdate(id, {
      title,
      amount,
      category,
      date
    }, { new: true });

    if (!updatedExpense) return res.status(404).send('Expense not found');

    res.redirect('/expenses');
  } catch (error) {
    console.error('Error updating expense:', error.message);
    res.status(500).send('Server Error');
  }
};

// ====================== Income =========================
exports.getIncomePage = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.render('income/income', { user: req.user, incomes });
  } catch (err) {
    console.error('Error loading income page:', err);
    res.status(500).send('Server Error');
  }
};

exports.addIncome = async (req, res) => {
  const { source, amount, date } = req.body;

  if (!source || !amount || !date) {
    return res.status(400).send('All fields are required.');
  }

  try {
    const newIncome = new Income({
      userId: req.user._id,
      title: source,
      amount,
      date,
    });

    await newIncome.save();
    res.redirect('/income');
  } catch (err) {
    console.error('Error adding income:', err);
    res.status(500).send('Server Error');
  }
};

exports.deleteIncome = async (req, res) => {
  const incomeId = req.params.id;

  try {
    await Income.findOneAndDelete({ _id: incomeId, userId: req.user._id });
    res.redirect('/income');
  } catch (err) {
    console.error('Error deleting income:', err);
    res.status(500).send('Server Error');
  }
};
