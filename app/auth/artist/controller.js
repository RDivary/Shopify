const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Artist = require('../../artist/model')
const config = require('../../config')
const { getToken } = require('../../utils/get-token')

const localStrategy = async (email, password, done) => {

    try {

        let artist = await Artist
            .findOne({email})
            .select('-__v -createdAt -updatedAt -token -album')

        if(!artist) return done()

        if (bcrypt.compareSync(password, artist.password)) {

            ({password, ...artistWithoutPassword} = artist.toJSON())
            return done(null, artistWithoutPassword)
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

        let artist = new Artist(payload)

        await artist.save()

        return res.json(artist)

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

    passport.authenticate('artist', async(err, artist) => {

        if(err) return next(err)

        if (!artist) return res.json({error: 1, message: 'email or password incorrect'})

        let signed = jwt.sign(artist, config.secretKey)

        await Artist.findOneAndUpdate({_id: artist._id}, {$push: {token: signed}}, {new: true})

        return res.json({
            message: 'logged in successfully',
            artist,
            token: signed
        })

    })(req, res, next);

}

const logout = async (req, res, next) => {

    let token = getToken(req)

    let artist = await Artist.findOneAndUpdate({token: {$in: [token]}}, {$pull: {token}}, {useFindAndModify: false})

    if(!artist || !token) {
        return res.json({
            error: 1,
            message: 'No artist Found'
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