exports.calculateNights = (checkIn, checkOut) => {
    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    if (nights < 0 || isNaN(nights)) throw new Error('Invalid check-in or check-out date');
    return Math.ceil(nights);
};
