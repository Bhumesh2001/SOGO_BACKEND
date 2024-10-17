const express = require('express');
const router = express.Router();

const userController = require('../controllers/userCtrl');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { checkRequiredFields } = require('../middleware/validateMiddleware');

router.post(
    '/signup', 
    checkRequiredFields(["firstName", "lastName", "email", "password"]),
    userController.signup
);
router.post(
    '/verify-otp', 
    checkRequiredFields(["email", "otp"]),
    userController.verifyOTP
);
router.post(
    '/login', 
    checkRequiredFields(["email", "password"]),
    userController.login
);
router.get('/check-login', isAuthenticated, userController.isLoggedin);
router.get('/profile', isAuthenticated, userController.profile);
router.post('/logout', userController.logout);

module.exports = router;
