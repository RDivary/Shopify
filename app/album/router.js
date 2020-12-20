const router = require('express').Router();
const multer = require('multer')
const os = require('os')

const albumController = require('./controller')

router.post('/album', multer().none(), albumController.store)
router.get('/album', albumController.index)
router.get('/album/:id', albumController.show)
router.put('/album/:id', multer().none(), albumController.update)

module.exports = router;
