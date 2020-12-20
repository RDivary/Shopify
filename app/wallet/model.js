const mongoose = require('mongoose')
const { model, Schema } =mongoose

const walletSchema = Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    balance: {
        type: Number,
        default: 0
    },

    transaction: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
    }],

    wallet_history: [{
        type: Schema.Types.ObjectId,
        ref: 'WalletHistory',
    }],

}, {timestamps: true})

module.exports = model('Wallet', walletSchema)
