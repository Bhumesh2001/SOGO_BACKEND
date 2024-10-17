const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: [true, 'Hotel ID is required'],
        index: true
    },
    roomName: {
        type: String,
        required: [true, 'Room name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Room name must be at least 3 characters long'],
        maxlength: [100, 'Room name must be less than 100 characters']
    },
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true,
        trim: true,
        maxlength: [10, 'Room number must be less than 10 characters'],
        validate: {
            validator: function (v) {
                return /^[0-9]+$/.test(v);
            },
            message: 'Room number must be numeric'
        }
    },
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        enum: [
            'Single',
            'Double',
            'Suite',
            'Deluxe',
            'Standard',
            'Superior',
            'Luxury',
            'Premium',
            'Junior Suite',
            'Mini Suite',
            'Studio',
            'Executive'
        ],
        trim: true,
        maxlength: [50, 'Room type must be less than 50 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'],
        validate: {
            validator: Number.isFinite,
            message: 'Price must be a valid number'
        },
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [500, 'Description must be less than 500 characters'],
        trim: true,
    },
    images: {
        type: [String],
        required: [true, 'At least one image URL is required'],
        validate: {
            validator: function (images) {
                return images.every(img => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(img));
            },
            message: 'Each image URL must be valid and end with .jpg, .jpeg, .png, or .gif',
        }
    },
    available: {
        type: Boolean,
        default: true,
        index: true
    },
    maxAdults: {
        type: Number,
        required: [true, 'Maximum number of adults is required'],
        min: [1, 'At least one adult must be allowed']
    },
    maxChildren: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Maximum number of children must be a non-negative number'
        }
    }
}, { timestamps: true });

roomSchema.index({ hotelId: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ available: 1 });
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ roomName: 1 });

module.exports = mongoose.model('Room', roomSchema);
