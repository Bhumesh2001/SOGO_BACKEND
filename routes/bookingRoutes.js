const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingCtrl');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/', isAuthenticated, bookingController.createBooking);
router.get('/', isAuthenticated, bookingController.getAllBookings);
router.get('/:id', isAuthenticated, bookingController.getBookingById);
router.put('/:id', isAuthenticated, bookingController.updateBooking);
router.put('/status/update', isAuthenticated, bookingController.updateStatus);
router.delete('/:id', isAuthenticated, bookingController.deleteBooking);

module.exports = router;
