const router = require('express').Router();
const multer = require('multer')

const walletController = require('./controller')

router.post('/wallet/topup', multer().none(), walletController.topUp)

module.exports = router;
