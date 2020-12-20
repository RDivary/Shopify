const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const transactionDetailSchema = Schema({

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Minimal price is 0'],

    },

    song: {
        type: Schema.Types.ObjectId,
        ref: 'Song'
    },

    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }
});

module.exports = model('TransactionDetail', transactionDetailSchema);
