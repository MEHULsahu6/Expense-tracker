const jwt = require('jsonwebtoken');

const protect = (req, res) => {
  const user = { id: 'user_id_here' }; // Example user object
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Set the cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS only)
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 3600000, // Cookie expiry (e.g., 1 hour in milliseconds)
  });

  res.json({ message: 'Login successful' });
};

module.exports = protect;
