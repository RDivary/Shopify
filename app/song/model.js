const mongoose = require('mongoose')
const { model, Schema } =mongoose

const Artist = require('../artist/model')

const songSchema = Schema({

    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [255, 'Maximal character is 255'],
    },

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Minimal price is 0'],
    },

    downloaded: {
        type: Number,
        default: 0
    },

    release: {
        type: Number,
        required: [true, 'Release is required'],
        max: [new Date().getFullYear(), `maximal release is ${new Date().getFullYear()}`]
    },

    song_url: String,

    image_url: String,


    genre: {
        type: Schema.Types.ObjectId,
        ref: 'Genre'
    },

    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album'
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
    },

}, {timestamps: true})

songSchema.path('release').validate(async function(value) {

    try {
        const debut = await Artist.findOne({_id: this.artist});
        return value > debut.debut
    } catch (err) {
        throw err
    }
}, attr => `release song cannot be less than debut artist`)

module.exports = model('Song', songSchema)