const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine
app.set('view engine', 'ejs');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const staticRoutes = require('./routes/static.routes');


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/static', staticRoutes);



app.get('/', (req, res) => {
  res.render('home');
});


app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(` App is running at http://localhost:${PORT}`);
});
