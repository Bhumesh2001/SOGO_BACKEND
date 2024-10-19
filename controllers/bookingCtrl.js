const Booking = require('../models/bookingModel');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Booking
exports.createBooking = async (req, res, next) => {
    try {
        const { hotelId, roomId, checkIn, checkOut, totalPrice } = req.body;

        const userId = req.user._id;

        if (!userId) return res.status(404).json({ success: false, message: 'userId not found!' });

        // const conflictingBooking = await Booking.findOne({ hotelId, roomId, checkIn, checkOut });

        // if (conflictingBooking) {
        //     return res.status(400).json({
        //         message: 'Room is already booked for the selected dates.'
        //     });
        // }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100),
            currency: 'usd',
        });

        const newBooking = new Booking({ userId, ...req.body });
        await newBooking.save();

        const bookingObject = newBooking.toObject();

        res.status(201).json({ ...bookingObject, clientSecret: paymentIntent.client_secret });
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

// update payment status
exports.updateStatus = async (req, res, next) => {
    try {
        const { hotelId, roomId, status } = req.body;

        const userId = req.user._id;
        if (!userId) return res.status(404).json({ success: false, message: 'userId not found!' });

        const booking_data = await Booking.findOneAndUpdate(
            { userId, hotelId, roomId },
            { status },
            { new: true, runValidators: true }
        );
        if (!booking_data) return res.status(404).json({ success: false, message: 'Data not found!' });
        res.status(200).json({ success: true, message: 'status updated successful...!' });

    } catch (error) {
        next(error);
    }
};
