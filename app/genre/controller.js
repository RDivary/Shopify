const Genre = require('./model')
const User = require('../user/model')
const { policyFor } = require('../policy')
const { checkedIsActive } = require('../auth/middleware')

const store = async (req, res, next) => {

    try {

        let user = await User.findOne({_id: req.user._id})

        if (user && !user.isActive)
            return res.json({
                error: 1,
                message: 'akun anda masih belum aktif, silahkan hubungi administrator'
            })

        let policy = policyFor(req.user)

        if(!policy.can('create', 'Genre')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk membuat genre'
            })
        }

        let payload = req.body;
        let genre = new Genre(payload)
        await genre.save();

        return res.json(genre)

    } catch (err) {

        if (err && err.name === 'validationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err)
    }
}

const update = async (req, res, next) => {

    try {

        let policy = policyFor(req.user)

        if(!policy.can('update', 'Genre')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk mengupdate tag'
            })
        }

        let payload = req.body;
        let genre = await Genre.findOneAndUpdate({_id: req.params.id}, payload
            ,{new: true, runValidators: true})

        return res.json(genre)

    } catch (err) {

        if (err && err.name === 'validationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        } else if (err && err.name === 'CastError') {
        return res.json({
            error: 1,
            message: 'Genre not found',
        });
    }
        next(err)
    }
}

const index = async (req, res, next) => {

    try {

        let policy = policyFor(req.user)

        if(!policy.can('view', 'Genre')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk menghapus tag'
            })
        }

        let genre = await Genre
            .find()
            .sort('name')

        return res.json(genre)


    } catch (err) {
        next(err)
    }
}

module.exports = {
    store,
    update,
    index,
}
