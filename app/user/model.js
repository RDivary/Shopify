const mongoose = require('mongoose')
const { model, Schema } =mongoose
const bcrypt = require('bcrypt')
const Wallet = require('../wallet/model')

const HASH_ROUND = 12

const userSchema = Schema({

    full_name: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [255, 'Maximal character is 255'],
        minlength: [3, 'Minimal character is 3']
    },
    email: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [255, 'Maximal character is 255']
    },
    password: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [255, 'Maximal character is 255'],
    },

    isActive : {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    gender: {
        type: String,
        enum: ['Both', 'Male', 'Female'],
        default: 'both'
    },
    token: {
        type: [String]
    },

    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],

    albums: [{
        type: Schema.Types.ObjectId,
        ref: 'Album'
    }],

}, {timestamps: true})

userSchema.path('email').validate(function(value){
    const EMAIL_RE =  /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return EMAIL_RE.test(value)
}, attr => `${attr.value} email not valid`);

userSchema.path('email').validate(async function(value) {
    try {
        const count = await this.model('User').count({email: value});
        return !count
    } catch (err) {
        throw err
    }
}, attr => `${attr.value} already registered`)

userSchema.pre('save', function (next){
    this.password = bcrypt.hashSync(this.password, HASH_ROUND)
    this.songs=[]
    this.albums=[]
    next()
})

userSchema.post('save', async function(){

    if (this.role === 'user'){

        let wallet = new Wallet({
            user: this._id
        })

        await wallet.save()
    }

});

module.exports = model('User', userSchema)