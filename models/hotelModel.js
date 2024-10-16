const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        minlength: [3, 'Hotel name must be at least 3 characters'],
        maxlength: [100, 'Hotel name must be less than 100 characters'],
        unique: true,
    },
    description: {
        type: String,
        maxlength: [500, 'Description must be less than 500 characters'],
    },
    amenities: {
        type: [String],
        validate: {
            validator: (amenities) => Array.isArray(amenities) && amenities.length > 0,
            message: 'At least one amenity is required'
        }
    },
    images: {
        type: [String],
        validate: {
            validator: (images) => images.every(image => image.startsWith('http')),
            message: 'Each image must be a valid URL'
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: [true, 'Location type is required']
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required'],
            validate: {
                validator: (coords) => coords.length === 2 &&
                    coords[0] >= -180 && coords[0] <= 180 &&
                    coords[1] >= -90 && coords[1] <= 90,
                message: 'Coordinates must contain valid longitude and latitude'
            }
        }
    },
    address: {
        city: {
            type: String,
            required: [true, 'City is required'],
            minlength: [2, 'City must be at least 2 characters long'],
            maxlength: [100, 'City must be less than 100 characters']
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            minlength: [2, 'State must be at least 2 characters long'],
            maxlength: [100, 'State must be less than 100 characters']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            minlength: [2, 'Country must be at least 2 characters long'],
            maxlength: [100, 'Country must be less than 100 characters']
        },
        zipcode: {
            type: String,
            required: [true, 'Zipcode is required'],
            validate: {
                validator: (v) => /^\d{5}(-\d{4})?$/.test(v),
                message: 'Zipcode must be a valid format (e.g., 12345 or 12345-6789)'
            }
        }
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            validate: {
                validator: (v) => /^\+?[1-9]\d{1,14}$/.test(v),
                message: 'Phone number must be a valid phone number'
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,  // Ensure the email is unique
            validate: {
                validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: 'Email must be a valid email address'
            }
        }
    },
}, { timestamps: true });

hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ 'address.state': 1 });
hotelSchema.index({ 'address.country': 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
