const router = require('express').Router();
const multer = require('multer')
const voucherTopUpController = require('./controller')

router.post('/generated-voucher', multer().none(), voucherTopUpController.generatedVoucher)

module.exports = router;
