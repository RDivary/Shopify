const router = require('express').Router();
const multer = require('multer')
const transactionController = require('./controller')

router.post('/transaction', multer().none(), transactionController.transaction)

module.exports = router;
