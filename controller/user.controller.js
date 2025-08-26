const jwt = require('jsonwebtoken');
const budgetScema = require('../models/budget');
const Expense = require('../models/expense');
const Income = require('../models/Income');
const getTotalExpenseAndIncome = require('../helpers/calculateTotals'); 

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
    const { totalExpense, totalIncome } = await getTotalExpenseAndIncome(user._id);

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




// ---------------- Reports ----------------

// Reports Page with real data
exports.report = async (req, res) => {
  try {
    const userId = req.user._id;

    // MongoDB aggregation: month-wise total and top category
    const expenses = await Expense.aggregate([
      { $match: { userId } }, // sirf current user ke expenses
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          total: { $sum: "$amount" },
          categories: { $push: { category: "$category", amount: "$amount" } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } } // latest month pehle
    ]);

    // Format data for EJS
    const reportData = expenses.map((exp, i) => {
      const catTotals = {};
      exp.categories.forEach(c => {
        catTotals[c.category] = (catTotals[c.category] || 0) + c.amount;
      });
      const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const monthName = new Date(exp._id.year, exp._id.month - 1)
                        .toLocaleString("default", { month: "long" });

      return {
        index: i + 1,
        month: `${monthName} ${exp._id.year}`,
        total: exp.total,
        topCategory
      };
    });

    res.render("report/report", { user: req.user, reportData });
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).send("Server Error");
  }
};


const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// ✅ CSV Export (real data)
exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ userId }).lean();

    // Month-wise aggregation
    const monthMap = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const month = d.toLocaleString("default", { month: "long", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = { total: 0, categories: {} };
      monthMap[month].total += exp.amount;
      monthMap[month].categories[exp.category] = (monthMap[month].categories[exp.category] || 0) + exp.amount;
    });

    const csvData = Object.entries(monthMap).map(([month, data]) => {
      const topCategory = Object.entries(data.categories).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A";
      return { Month: month, "Total Spent": data.total, "Top Category": topCategory };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("expense_report.csv");
    res.send(csv);

  } catch(err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ PDF Export (real data)
exports.exportPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ userId }).lean();

    const monthMap = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const month = d.toLocaleString("default", { month: "long", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = { total: 0, categories: {} };
      monthMap[month].total += exp.amount;
      monthMap[month].categories[exp.category] = (monthMap[month].categories[exp.category] || 0) + exp.amount;
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=expense_report.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Expense Report", { align: "center" });
    doc.moveDown();

    Object.entries(monthMap).forEach(([month, data], i) => {
      const topCategory = Object.entries(data.categories).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A";
      doc.fontSize(12).text(`${i+1}. Month: ${month}, Total: ₹${data.total}, Top Category: ${topCategory}`);
    });

    doc.end();

  } catch(err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};








// Analytics Page
exports.analytics = (req, res) => {
  res.render('analytics/analytics', { user: req.user });
};

// ====================== Budget =========================
exports.getBudgetPage = async (req, res) => {
  try {
    const budgets = await budgetScema.find({ userId: req.user._id });
    const { totalExpense, totalIncome } = await getTotalExpenseAndIncome(req.user._id);

    res.render("budget/budget", {
      user: req.user,
      budgets,
      totalExpense,
      totalIncome,
      totalSpent: totalExpense, // 👈 yeh naam tum template me use kar sakte ho
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

    if (category === "custom" && customCategory && customCategory.trim() !== "") {
      category = customCategory.trim();
    }

    if (!category || !amount) {
      return res.status(400).send('Category and amount are required');
    }

    // डेटाबेस में नया बजट बनाएं
    await budgetScema.create({
      userId: req.user._id,
      category,
      amount,
      remaining: amount,
      spent: 0
    });

    // महत्वपूर्ण बदलाव: पेज को रेंडर करने के बजाय उसे रीडायरेक्ट करें
    // इससे ब्राउज़र रीफ़्रेश पर फॉर्म को दोबारा सबमिट नहीं करेगा
    res.redirect('/budget');

  } catch (error) {
    console.error('Error in budget:', error);
    res.status(500).send('Internal Server Error');
  }
};


exports.deleteBudget = async(req,res)=>{
  const {id} = req.params;
  try {
    if(!id) return res.status(400).send('Budget ID is required');

    const budget = await budgetScema.findByIdAndDelete(id);
    if(!budget) return res.status(404).send('Budget not found');

    res.redirect('/budget');
  } catch (error) {
    console.error('Error deleting budget:', error.message);
    res.status(500).send('Server Error');
  }
}


// ====================== Expense =========================
exports.getAllExpenses = async (req, res) => {
  try {
    
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });

    
    const budgets = await budgetScema.find({ userId: req.user._id });
    
    
    const categories = [...new Set(budgets.map(b => b.category))];

    
    res.render('expenses/expenses', {
      expenses,
      categories, 
      user: req.user,
    });
    
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



// ====================== Analytics =========================



exports.analytics = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });

    // Category-wise aggregation
    const categoryMap = {};
    expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });

    const categoryLabels = Object.keys(categoryMap);
    const categoryValues = Object.values(categoryMap);

    // Monthly aggregation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = {};
    monthNames.forEach(m => (monthMap[m] = 0));

    expenses.forEach(exp => {
      const expDate = exp.date instanceof Date ? exp.date : new Date(exp.date);
      const month = monthNames[expDate.getMonth()];
      monthMap[month] += exp.amount;
    });

    const monthlyLabels = monthNames;
    const monthlyValues = monthlyLabels.map(m => monthMap[m]);

    res.render("analytics/analytics", {
      categoryLabels,
      categoryValues,
      monthlyLabels,
      monthlyValues,
      user: req.user
    });

  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).send("Server Error");
  }
};




