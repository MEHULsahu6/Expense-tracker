const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email,
      password: hashedPassword
    });

    res.redirect('/');
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    });

    res.redirect('/');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/api/auth/login');
};
