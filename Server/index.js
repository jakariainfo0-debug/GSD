require('dotenv').config();
const PORT = process.env.PORT || 5000;
const express = require('express');
const db = require('./src/Config/db');
const authRoute = require('./src/Routes/authRoute');
const orderRoute = require('./src/Routes/orderRoute');
const cors = require('cors');

const app = express();

app.use(express.json());

// ✅ FIXED CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gsd-1-dt4w.onrender.com', // 👈 trailing slash নেই
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / server-to-server এর জন্য origin undefined
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use('/api/auth', authRoute);
app.use('/api/orders', orderRoute);

app.listen(PORT, () => {
  db();
  console.log(`✅ Server running on port ${PORT}`);
});
