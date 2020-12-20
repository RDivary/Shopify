const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { getToken } = require('../utils/get-token')
const config = require('../config')
const User = require('../user/model')
const Artist = require('../artist/model')

const decodeToken = () => {

    return async(req, res, next) => {

        try {

            let token = getToken(req)

            if (!token) return next()

            req.user = jwt.verify(token, config.secretKey)

            let user = await User.findOne({token: {$in: [token]}})
            let artist = await Artist.findOne({token: {$in: [token]}})

            if (!user && !artist) {
                return res.json({
                    error: 1,
                    message: 'Token expired',
                })
            }

        } catch (err) {

            if(err && err.name === 'JsonWebTokenError'){
                return res.json({
                    error: 1,
                    message: err.message
                });
            }
            next(err);

        }
        return next();
    }
}

module.exports = {
    decodeToken,
}