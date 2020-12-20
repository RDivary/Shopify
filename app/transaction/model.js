const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const Album = require('../album/model')
const WalletHistory = require('../wallet-history/model')

const transactionSchema = Schema({

    date: {
        type: String,
        value: new Date().toLocaleDateString()
    },

    time: {
        type: String,
        value: new Date().toLocaleTimeString()
    },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Minimal amount is 0'],
        default: 0
    },

    discount: {
        type: Number,
        required: [true, 'Discount is required'],
        min: [0, 'Minimal discount is 0'],
        default: 0
    },

    total_discount: {
        type: Number,
        required: [true, 'Total discount is required'],
        min: [0, 'Minimal Total discount is 0'],
        default: 0
    },

    wallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },

    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album'
    },

    transaction_detail: [{
        type: Schema.Types.ObjectId,
        ref: 'TransactionDetail'
    }]

});

transactionSchema.pre('save', async function(next){

    this.amount = this.transaction_detail.reduce((sum, item) => sum += (item.price),0)


    if (this.album) {

        let album = await Album.findOne({_id: this.album})

        if (album) {
            this.discount = album.discount
            this.total_discount = this.amount * this.discount / 100
            this.amount -= this.total_discount;
        }
    }

    next()

});

module.exports = model('Transaction', transactionSchema);
