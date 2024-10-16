const User = require('../models/userModel');
const { storeToken } = require('../utils/token');

// Signup
exports.signup = async (req, res, next) => {
    const { name, email, password, role = 'user' } = req.body;
    try {
        if (role === 'admin' && await User.exists({ role })) {
            return res.status(409).json({ success: false, message: 'Admin already exists' });
        }
        const user = await new User({ name, email, password, role }).save();
        res.status(201).json({ success: true, message: 'User created successfully', user });
    } catch (error) {
        next(error);
    }
};

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = user.generateAuthToken();
        storeToken(res, token);

        res.status(200).json({ _id: user._id, token, message: 'User logged in successful...!' });
    } catch (error) {
        next(error);
    }
};

// profile
exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// logout
exports.logout = (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1] || req.cookies?.token;
    if (!token) {
        return res.status(200).json({ success: true, message: 'Token not found!' });
    }
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Strict',
        secure: true,
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully', token });
};
