const express = require('express');
const router = express.Router();

const userController = require('../controllers/userCtrl');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', isAuthenticated, userController.profile);
router.post('/logout', userController.logout);

module.exports = router;
