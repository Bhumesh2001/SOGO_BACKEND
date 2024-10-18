const Room = require('../models/roomModel');

// Create a new room
exports.createRoom = async (req, res, next) => {
    try {
        const { body } = req;

        if (!body || (Array.isArray(body) && !body.length)) {
            return res.status(400).json({ message: 'Invalid room data' });
        }

        const rooms = Array.isArray(body)
            ? await Room.insertMany(body)
            : await Room.create(body);

        res.status(201).json({
            message: Array.isArray(body) ? 'Rooms created successfully' : 'Room created successfully',
            rooms,
        });
    } catch (error) {
        next(error);
    }
};

// Get all rooms
exports.getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().populate('hotelId');
        if (rooms.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found!' });
        }        
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
};

// Get a room by ID
exports.getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId');
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
};

// Update a room by ID
exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room updated successfully', room });
    } catch (error) {
        next(error);
    }
};

// Delete a room by ID
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room deleted successfully', room });
    } catch (error) {
        next(error);
    }
};
