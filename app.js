require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Routes
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');

// error handler middleware
const { errorHandler } = require('./utils/errorHandler');

// DB
const { connectDB } = require('./db/connect');

// middleware
app.use(cors({
    origin: ["https://sogo-web.netlify.app"],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
connectDB();

// Main Routes
app.use('/api/user', userRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/booking', bookingRoutes);

// error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
