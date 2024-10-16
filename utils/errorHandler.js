const handleMongooseError = (err) => {
    let errors = {};

    if (err.name === 'ValidationError') {
        errors.validationErrors = Object.values(err.errors).map(e => e.message);
    } else if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        errors.uniqueErrors = [`${field} already exists`];
    } else if (err.name === 'CastError') {
        errors.castErrors = [`Invalid value for ${err.path}: ${err.value}`];
    } else {
        errors.otherErrors = [err.message];
    }

    return errors;
};

exports.errorHandler = (err, req, res, next) => {
    const errorResponse = handleMongooseError(err);
    const statusCode = err.name === 'ValidationError' || err.code === 11000 || err.name === 'CastError' ? 400 : 500;

    res.status(statusCode).json({ success: false, errors: errorResponse });
};
