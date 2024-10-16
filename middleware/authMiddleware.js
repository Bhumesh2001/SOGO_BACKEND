const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        req.user = user;
        next();
    } catch (error) {
        const errorMessages = {
            TokenExpiredError: 'Token has expired. Please log in again.',
            JsonWebTokenError: 'Invalid token. Please log in again.',
            NotBeforeError: 'Token not active. Try again later.',
        };

        const message = errorMessages[error.name] || 'An internal error occurred.';
        res.status(error.name === 'TokenExpiredError' ? 401 : 400).json({ message });
    }
};
