const router = require('express').Router()
const multer = require('multer')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const authUserController = require('../user/controller')

passport.use('user', new LocalStrategy({usernameField: 'email'}, authUserController.localStrategy))

router.post('/register', multer().none(), authUserController.register)
router.post('/login', multer().none(), authUserController.login)
router.post('/logout', authUserController.logout)

module.exports = router
