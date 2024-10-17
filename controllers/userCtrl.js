const User = require('../models/userModel');
const client = require('../utils/redis');

const { storeToken } = require('../utils/token');
const { sendOTPEmail } = require('../utils/otp');

// Signup with OTP
exports.signup = async (req, res, next) => {
    const { firstName, lastName, email, password, role = 'user' } = req.body;

    try {
        // Allow only one admin
        if (role === 'admin' && await User.exists({ role })) {
            return res.status(409).json({ success: false, message: 'Admin already exists' });
        }

        // Generate 6-digit OTP and expiry time (10 minutes)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        // Store user data in Redis, expires in 10 minutes
        await client.setEx(email, 600, JSON.stringify({ firstName, lastName, email, password, role, otp, otpExpiry }));

        // Send OTP via email
        await sendOTPEmail(email, otp);

        res.status(201).json({ success: true, message: 'OTP sent to your email, Please check!' });
    } catch (error) {
        next(error);
    }
};

// OTP verification and moving user data to MongoDB
exports.verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;

    try {
        const userDataString = await client.get(email);

        if (!userDataString) return res.status(400).json({ success: false, message: 'OTP expired or invalid' });

        const { firstName, lastName, password, role, otp: storedOtp, otpExpiry } = JSON.parse(userDataString);
        if (!storedOtp || !otpExpiry || String(storedOtp) !== String(otp) || otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const user = await new User({ firstName, lastName, email, password, role }).save();
        await client.del(email);

        const token = user.generateAuthToken();
        storeToken(res, token);

        res.status(200).json({ success: true, message: 'User verified and created successfully', token, user });
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
