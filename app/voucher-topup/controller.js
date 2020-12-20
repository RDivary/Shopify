const config = require('../config')
const VoucherTopUp = require('./model')
const { policyFor } = require('../policy')

let crypto = require('crypto');
const voucher_codes = require('voucher-code-generator');

const generatedVoucher = async (req, res, next) => {

    try {

        let { nominal, howMany } = req.body

        let policy = policyFor(req.user)

        if(!policy.can('generatedVoucher', 'voucherTopUp')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk generated voucher'
            })
        }

        let vouchers = voucher_codes.generate({
            length: 16,
            count: howMany,
            charset: '0123456789',
            pattern: "####-####-####-####"
        });

        for (let i = 0; i < vouchers.length; i++){

            try {

                let voucherTopUp = new VoucherTopUp({
                    voucher: vouchers[i],
                    nominal,
                })

                await voucherTopUp.save()

            } catch (err) {

                if (err && err.name === 'MongoError') {
                    return res.json({
                        error: 1,
                        message: `Duplicate voucher, ${i} voucher yang sudah tersimpan`,
                    });
                } else if (err && err.name === 'ValidationError') {
                    return res.json({
                        error: 1,
                        message: err.message,
                        fields: err.errors
                    });
                }

                next(err)

            }
        }

        return res.json(`sukses generated voucer ${howMany} kali`)

    } catch (err) {

        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err)
    }
}

module.exports = {
    generatedVoucher
}