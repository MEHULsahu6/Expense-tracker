

const mongoose = require('mongoose');

const MONGO_URI ='mongodb://127.0.0.1:27017/xpenso';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB successfully Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
