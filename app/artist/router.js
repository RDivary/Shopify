const router = require('express').Router();
const artistController = require('./controller')

router.get('/artist', artistController.index)

module.exports = router;
