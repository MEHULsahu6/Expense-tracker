const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 3000;


connectDB();


app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');


const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const staticRoutes = require('./routes/static.routes');
const homeRoutes = require('./routes/user.routes');


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/static', staticRoutes);
app.use('/', homeRoutes)






app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});


app.listen(PORT, () => {
  console.log(` App is running at http://localhost:${PORT}`);
});
