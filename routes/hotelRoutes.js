const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelCtrl');

router.post('/', hotelController.getAllHotels);

module.exports = router;
