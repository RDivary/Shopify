const mongoose = require('mongoose')
const { model, Schema } =mongoose
const bcrypt = require('bcrypt')

const HASH_ROUND = 12

const artistSchema = Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [255, 'Maximal character is 255'],
        minlength: [3, 'Minimal character is 3']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        maxlength: [255, 'Maximal character is 255']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxlength: [255, 'Maximal character is 255'],
    },

    debut: {
        type: Number,
        required: [true, 'Debut is required'],
        min: [1900, 'Minimal years is 1900'],
        max: [new Date().getFullYear(), `maximal debut is ${new Date().getFullYear()}`]
    },

    album: [{
        type: Schema.Types.ObjectId,
        ref: 'Album',
    }],

    isActive : {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ['artist'],
        default: 'artist'
    },

    gender: {
        type: String,
        enum: ['both', 'male', 'female'],
        default: 'both'
    },
    token: {
        type: [String]
    }
}, {timestamps: true})

artistSchema.path('email').validate(function(value){
    const EMAIL_RE =  /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return EMAIL_RE.test(value)
}, attr => `${attr.value} Email not valid`);

artistSchema.path('email').validate(async function(value) {
    try {
        const count = await this.model('Artist').count({email: value});
        return !count
    } catch (err) {
        throw err
    }
}, attr => `${attr.value} Already registered`)

artistSchema.pre('save', function (next){
    this.password = bcrypt.hashSync(this.password, HASH_ROUND)
    next()
})

module.exports = model('Artist', artistSchema)