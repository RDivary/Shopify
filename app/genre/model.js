const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const genreSchema = Schema({
    name: {
        type: String,
        minlength: [1, 'Minimal character is 1'],
        maxLength: [20, 'Maximal character is 20'],
        required: [true, 'Genre is required']
    }
});

module.exports = model('Genre', genreSchema)
