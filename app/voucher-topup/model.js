const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const bcrypt = require('bcrypt');

const HASH_ROUND = 10;

const voucherTopUpSchema = Schema({
    voucher: {
        type: String,
        minlength: [19, 'Minimal character is 19'],
        maxlength: [19, 'Maximal character is 19'],
        required: [true, 'Voucher is required'],
        unique : true
    },
    // code: {
    //     type: String,
    //     unique : true
    // },
    nominal: {
        type: Number,
        enum: [10000, 20000, 50000, 100000, 500000],
    },
    isUse: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

// voucherTopUpSchema.pre('save', function(next){
//     // console.log(this)
//     this.code = bcrypt.hashSync(this.voucher, HASH_ROUND);
//     // console.log(this)
//     next() // <---
// });


module.exports = model('VoucherTopUp', voucherTopUpSchema)