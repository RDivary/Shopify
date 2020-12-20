const router = require('express').Router()
const multer = require('multer')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const authArtistController = require('./controller')

passport.use('artist',new LocalStrategy({usernameField: 'email'}, authArtistController.localStrategy))

router.post('/artist/register', multer().none(), authArtistController.register)
router.post('/artist/login', multer().none(), authArtistController.login)
router.post('/artist/logout', authArtistController.logout)

module.exports = router
