const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../../user/model')
const config = require('../../config')
const { getToken } = require('../../utils/get-token')

const localStrategy = async ( email, password, done) => {

    try {

        let user = await User
            .findOne({email})
            .select('-__v -createdAt -updatedAt -token')

        if(!user) return done()

        if (bcrypt.compareSync(password, user.password)) {

            ({password, ...userWithoutPassword} = user.toJSON())
            return done(null, userWithoutPassword)
        }
    } catch (err) {
        done(err, null)
    }

    done()
}

const register = async (req, res, next) => {

    try {

        const payload = req.body
        payload.isActive = false

        let user = new User(payload)

        await user.save({
            songs: [],
            albums: []
        })

        return res.json(user)

    } catch (err) {

        if (err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
            next(err)
        }
    }
}

const login = async (req, res, next) => {

    passport.authenticate('user', async(err, user) => {

        if(err) return next(err)

        if (!user) return res.json({error: 1, message: 'email or password incorrect'})

        let signed = jwt.sign(user, config.secretKey)

        await User.findOneAndUpdate({_id: user._id}, {$push: {token: signed}}, {new: true})

        return res.json({
            message: 'logged in successfully',
            user,
            token: signed
        })

    })(req, res, next);

}

const logout = async (req, res, next) => {

    let token = getToken(req)

    let user = await User.findOneAndUpdate({token: {$in: [token]}}, {$pull: {token}}, {useFindAndModify: false})

    if(!user || !token) {
        return res.json({
            error: 1,
            message: 'No user Found'
        })
    }

    return res.json({
        error: 0,
        message: 'Logout successfully'
    })
}

module.exports = {
    register,
    localStrategy,
    login,
    logout
}