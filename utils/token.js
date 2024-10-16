exports.storeToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    });
};