const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/api/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id); 
    if (!user) {
      return res.redirect('/api/auth/login');
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.redirect('/api/auth/login');
  }
};

module.exports = authMiddleware;
