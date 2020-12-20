const router = require('express').Router();
const multer = require('multer')
const genreController = require('./controller')

router.post('/genre', multer().none(), genreController.store)
router.get('/genre/', genreController.index)
router.put('/genre/:id', multer().none(), genreController.update)
// router.delete('/genre/:id', genreController.destroy)

module.exports = router;
