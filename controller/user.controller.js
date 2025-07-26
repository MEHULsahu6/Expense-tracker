exports.dashboard = (req, res) => {
  res.render('dashboard/dashboard', { user: req.user });
}

exports.expenses = (req,res)=>{
    res.render('expenses/expenses', { user: req.user });
}

exports.report =(req,res)=>{
    res.render('report/report', { user: req.user });
}

exports.budget =(req,res)=>{
    res.render('budget/budget', { user: req.user });
}

exports.analytics =(req,res)=>{
    res.render('analytics/analytics', { user: req.user });
}