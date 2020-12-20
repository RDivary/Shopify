const router = require('express').Router();
const multer = require('multer')
const os = require('os')
const upload = multer({ dest: os.tmpdir()})

const songController = require('./controller')

let cpUpload = upload.fields([
    { name: 'song', maxCount: 1},
    { name: 'photo', maxCount: 1}
])

router.post('/song', cpUpload, songController.store)
router.get('/song', songController.index)
router.get('/song/:id', songController.show)
router.put('/song/:id', multer().none(), songController.update)

module.exports = router;
