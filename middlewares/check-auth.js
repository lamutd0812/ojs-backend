const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: 'Auth Failed!'
        });
    }
};

exports.restrict = (permittedRoles) => {
    return (req, res, next) => {
        if (permittedRoles.includes(req.user.role.permissionLevel)) {
            next();
        } else {
            return res.status(StatusCodes.FORBIDDEN).json({
                error: 'Access Forbidded!'
            });
        }
    }
}
