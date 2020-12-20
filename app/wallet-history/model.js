const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const walletHistorySchema = Schema({
    amount: {
        type: Number,
        min: [0, 'Minimal amount is 0'],
        required: [true, 'Amount is required']
    },
    type: {
        type: String,
        enum: ['TOPUP', 'PAYMENT'],
    },

}, {timestamps: true});

module.exports = model('WalletHistory', walletHistorySchema)