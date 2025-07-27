const jwt = require('jsonwebtoken');

exports.getHome = (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.render('home', { user: null });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.render('home', { user }); 
  } catch (error) {
    console.error('Error in getHome:', error);
    res.render('home', { user: null }); // Even if error, show home without user
  }
};


exports.dashboard = (req, res) => {
    res.render('dashboard/dashboard', { user: req.user });
}

exports.expenses = (req, res) => {
    res.render('expenses/expenses', { user: req.user });
}

exports.report = (req, res) => {
    res.render('report/report', { user: req.user });
}

exports.budget = (req, res) => {
    res.render('budget/budget', { user: req.user });
}

exports.analytics = (req, res) => {
    res.render('analytics/analytics', { user: req.user });
}