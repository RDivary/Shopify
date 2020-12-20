const mongoose = require('mongoose')
const { model, Schema } =mongoose

const Artist = require('../artist/model')
const Song = require('../song/model')

const albumSchema = Schema({

    album: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [255, 'Maximal character is 255'],
    },

    discount: {
        type: Number,
        min: [0, 'Minimal discount is 0'],
        max: [100, 'Maximal discount 100'],
        default: 0
    },

    release: {
        type: Number,
        required: [true, 'Release years is required'],
        max: [new Date().getFullYear(), `maximal release is ${new Date().getFullYear()}`]
    },

    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],

    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    },

}, {timestamps: true})

albumSchema.path('release').validate(async function(value) {

    try {
        const debut = await Artist.findOne({_id: this.artist});
        return value > debut.debut
    } catch (err) {
        throw err
    }
}, attr => `release album cannot be less than debut artist`)

albumSchema.post('save', async function(){

    this.songs.map(async (song) => {
        await Song.findOneAndUpdate({_id: song}, {album: this._id})
    })
});

albumSchema.post('validate', async function(){

    this.songs.map(async (song) => {
        await Song.findOneAndUpdate({_id: song}, {album: this._id})
    })
});

module.exports = model('Album', albumSchema)