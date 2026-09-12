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
app.use(
  cors({
    origin: 'http://localhost:5173', // 👈 এখানে // যোগ করা হয়েছে
    credentials: true,
  }),
);

app.use('/api/auth', authRoute);
app.use('/api/orders', orderRoute);

app.listen(PORT, () => {
  db();
  console.log(`Server running on http://localhost:${PORT}`); // ✅ http (https না)
});
