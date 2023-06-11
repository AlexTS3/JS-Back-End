const { SECRET } = require('../config/config');
const jwt = require('../lib/jwt');

exports.auth = async (req, res, next) => {
    const token = req.cookies['auth'];

    if (token) {
        //validate token
        try {
            const user = await jwt.verify(token, SECRET);

            req.user = user;
            //for navbar view 
            res.locals.user = user;
            //for req, res 
            res.locals.isAuthenticated = true;

            next();
        } catch (err) {
            res.clearCookie('auth');
            res.redirect('/users/login');
        }

    } else {
        next();
    }

};