const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomCtrl');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.post('/', isAuthenticated, isAdmin, roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.put('/:id', isAuthenticated, isAdmin, roomController.updateRoom);
router.delete('/:id', isAuthenticated, isAdmin, roomController.deleteRoom);

module.exports = router;
