const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: [true, 'Hotel ID is required'],
        index: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room ID is required'],
        index: true
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required'],
        validate: {
            validator: function (value) {
                return value >= new Date();
            },
            message: 'Check-in date cannot be in the past'
        }
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required'],
        validate: {
            validator: function (value) {
                return value > this.checkIn;
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    adults: {
        type: Number,
        required: [true, 'Number of adults is required'],
        min: [1, 'At least one adult must be present'],
    },
    children: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price must be a positive number']
    },
    status: {
        type: String,
        enum: ['confirmed', 'canceled', 'pending'],
        default: 'pending',
        required: true,
        index: true
    }
}, { timestamps: true });

bookingSchema.index({ userId: 1 });
bookingSchema.index({ hotelId: 1 });
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1 });
bookingSchema.index({ checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
