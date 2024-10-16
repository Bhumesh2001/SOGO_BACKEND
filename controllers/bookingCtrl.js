const Booking = require('../models/bookingModel');

// Create Booking
exports.createBooking = async (req, res, next) => {
    try {
        const { hotelId, roomId, checkIn, checkOut } = req.body;
        const conflictingBooking = await Booking.findOne({
            hotelId,
            roomId,
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({
                message: 'Room is already booked for the selected dates.'
            });
        }
        const newBooking = new Booking(req.body);
        await newBooking.save();

        res.status(201).json(newBooking);
    } catch (error) {
        next(error);
    }
};

// Get All Bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('user hotel room');
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Get Booking by ID
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.find(
            { _id: req.params.id, userId: req.user._id }
        ).populate('user hotel room');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};

// Update Booking
exports.updateBooking = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized to update' });
        }

        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};

// Delete Booking
exports.deleteBooking = async (req, res, next) => {
    try {
        const userId = req.user._id; 
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized to delete' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        next(error);
    }
};
