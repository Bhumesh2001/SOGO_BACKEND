const express = require('express');
const router = express.Router();

const hotelController = require('../controllers/hotelCtrl');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.post('/', isAuthenticated, isAdmin, hotelController.createHotel);
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.put('/:id', isAuthenticated, isAdmin, hotelController.updateHotel);
router.delete('/:id', isAuthenticated, isAdmin, hotelController.deleteHotel);

module.exports = router;
