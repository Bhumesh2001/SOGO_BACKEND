const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelCtrl');

router.post('/all', hotelController.getAllHotels);
router.post('/', hotelController.getHotel);

module.exports = router;
