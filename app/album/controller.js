const { subject } = require('@casl/ability');

const { policyFor } = require('../policy')
const Song = require('../song/model')
const Artist = require('../artist/model')
const Album = require('./model')

const store = async (req, res, next) => {

    try {

        let policy = policyFor(req.user)

        let artist = await Artist.findOne({_id: req.user._id})

        if (artist && !artist.isActive)
            return res.json({
                error: 1,
                message: 'akun anda masih belum aktif, silahkan hubungi administrator'
            })

        if(!policy.can('create', 'Album')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk membuat album'
            })
        }

        let payload = req.body;
        let user = req.user;

        for(let i = 0; i < payload.songs.length; i++){

            let checkedSong = await Song.findOne({_id: payload.songs[i]})

            if(!checkedSong){
                return res.json({
                    error: 1,
                    message: `Anda memasukan lagu yang belum terdaftar`
                })
            }

            if(checkedSong.artist != user._id){
                return res.json({
                    error: 1,
                    message: `anda bukan pemilik lagu dari ${checkedSong.title}`
                })
            }
        }

        payload.artist = user._id

        let album = new Album(payload)
        await album.save()
        await artist.update({$push: {album: album._id}
        })

        return res.json(album)

    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err)
    }
}

const show = async (req,res, next) => {
    try {

        let { id } = req.params

        let album = await Album
            .findOne({_id: id})
            .populate({
                path: 'artist',
                select: 'name _id gender debut',
            })
            .populate({
                path: 'songs',
                select: 'title price release downloaded _id',
                options: {
                    sort: {title: 1}
                }
            })

        return res.json(album)

    } catch (err) {

    }
}

const index = async (req, res, next) => {

    let {limit = 10, skip = 0, name = ''} = req.query


    let count = await Album.find({album: {$regex: name, $options: 'i'}}).countDocuments()

    let album = await Album.find({album: {$regex: name, $options: 'i'}})
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate({
            path: 'artist',
            select: 'name _id gender debut',
        })
        .populate({
            path: 'songs',
            select: 'title price release',
            options: {
                sort: {title: 1}
            }
        })

    return res.json({
        data: album,
        count
    })
}

const update = async (req, res, next) => {

    try {

        let { id } = req.params;

        let policy = policyFor(req.user)

        let artist = await Artist.findOne({_id: req.user._id})

        if (artist && !artist.isActive)
            return res.json({
                error: 1,
                message: 'akun anda masih belum aktif, silahkan hubungi administrator'
            })

        let album = await Album.findOne({_id: id})
        let subjectAlbum = subject('Album', {...album, artist: album.artist});

        if(!policy.can('update', subjectAlbum)){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk mengupdate album ini'
            })
        }

        let payload = req.body;
        let user = req.user;

        let errorSong = []

        for(let i = 0; i < payload.songs?.length; i++){

            let checkedSong = await Song.findOne({_id: payload.songs[i]})
                .populate({
                    path: 'album',
                    select: '_id album'
                })

            if(!checkedSong){
                return res.json({
                    error: 1,
                    message: `Anda memasukan lagu yang belum terdaftar`
                })
            }

            if(checkedSong.artist != user._id){
                return res.json({
                    error: 1,
                    message: `anda bukan pemilik lagu dari ${checkedSong.title}`
                })
            }

            if (checkedSong.album !==undefined && checkedSong.album._id.toString() !== id) {

                errorSong.push({
                    song: checkedSong,
                    message: `${checkedSong.title} Sudah masuk ke album ${checkedSong.album.album}, silahakan update album ${checkedSong.album.album} terlebih dahulu`
                })
            }
        }

        if (errorSong.length !== 0) {

            return res.json({
                error: 1,
                fields: errorSong,
                count: errorSong.length
            })
        }

        payload.artist = user._id

        if (payload.songs === undefined){
            payload.songs = []
        }

        let removeAlbum = []
        let addAlbum = []

        payload.songs.forEach(value => {
            if (!album.songs.includes(value)){
                addAlbum.push(value)
            }
        })

        album.songs.forEach(value => {
            if (!payload.songs.includes(value.toString())){
                removeAlbum.push(value)
            }
        })

        await Song.bulkWrite(removeAlbum.map(song => {
            return {
                updateOne: {
                    filter: {_id: song},
                    update: {$unset: {album: null}},
                }
            }
        }));

        album = await Album.findOneAndUpdate({_id: id}, payload, {new: true})

        await Song.bulkWrite(addAlbum.map(song => {
            return {
                updateOne: {
                    filter: {_id: song},
                    update: {album: id},
                }
            }
        }));

        return res.json(album)

    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        } else if (err && err.name === 'CastError') {
            return res.json({
                error: 1,
                message: 'Album not found',
            });
        }

        next(err)
    }
}

module.exports = {
    store,
    show,
    index,
    update,
}