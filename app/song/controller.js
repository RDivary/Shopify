const { subject } = require('@casl/ability');
const { policyFor } = require('../policy')
const fs = require('fs');
const path = require('path');

const Song = require('./model')
const Artist = require('../artist/model')
const Album = require('../album/model')
const Genre = require('../genre/model')
const config = require('../config');

const store = async (req, res, next) => {

    try {

        // console.log(req.files['song'])
        // console.log(req.files)


        let policy = policyFor(req.user)

        let artist = await Artist.findOne({_id: req.user._id})

        if (artist && !artist.isActive)
            return res.json({
                error: 1,
                message: 'akun anda masih belum aktif, silahkan hubungi administrator'
            })

        if(!policy.can('create', 'Song')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk membuat song'
            })
        }

        let payload = req.body;
        let user = req.user;

        payload.artist = user._id
        payload.downloaded = 0
        let song = new Song(payload)
        await song.save()

        if (req.files['song']){

            let fileSong = req.files['song'][0]
            let tmp_path = fileSong.path;
            let originalExt = fileSong.originalname.split('.')[fileSong.originalname.split('.').length - 1];
            let fileName = fileSong.filename + '.' + originalExt
            let target_path = path.resolve(config.rootPath, `public/upload/songs/${fileName}`)

            let src = fs.createReadStream(tmp_path)
            let dest = fs.createWriteStream(target_path)

            src.pipe(dest)

            src.on('end', async () => {
                await Song.findOneAndUpdate({_id: song._id}, {song_url: fileName}, {new: true})
            })

            src.on('error', async() => {
                next(err);
            });
        }

        if (req.files['photo']){

            let filePhoto = req.files['photo'][0]
            let tmp_path = filePhoto.path;
            let originalExt = filePhoto.originalname.split('.')[filePhoto.originalname.split('.').length - 1];
            let fileName = filePhoto.filename + '.' + originalExt
            let target_path = path.resolve(config.rootPath, `public/upload/photo/${fileName}`)

            let src = fs.createReadStream(tmp_path)
            let dest = fs.createWriteStream(target_path)

            src.pipe(dest)

            src.on('end', async () => {
                await Song.findOneAndUpdate({_id: song._id}, {image_url: fileName}, {new: true})
            })

            src.on('error', async () => {
                next(err)
            })
        }

        return res.json(song)

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

const index = async (req, res, next) => {

    let {limit = 10, skip = 0, title = '', artist = '', album = '', genre = []} = req.query

    let criteria = {}

    if (title.length){
        criteria = {
            ...criteria, title: {$regex: title, $options: 'i'}
        }
    }

    if (artist.length){

        let checkedArtist = await Artist.find({name: {$regex: artist, $options: 'i'}})

        criteria = {
            ...criteria, artist: {$in: checkedArtist.map(artist => artist._id)}
        }

    }

    if (album.length){

        let checkedAlbum = await Album.find({album: {$regex: album, $options: 'i'}})

        criteria = {
            ...criteria, album: {$in: checkedAlbum.map(album => album._id)}
        }

    }

    if (Array.isArray(genre) && genre.length !== 0) {
        criteria = {
            ...criteria, genre: {$in: genre.map(genre => genre)}
        }
    } else if (genre.length) {
        criteria = {
            ...criteria, genre
        }
    }

    let count = await Song.find(criteria).countDocuments();

    let song = await Song.find(criteria)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate({
            path: 'album',
            select: 'album',
        })
        .populate({
            path: 'artist',
            select: 'name'
        })
        .select('-__v')

    return res.json({data: song, count})
}

const show = async (req, res, next) => {

    try {

        let { id } = req.params

        let song = await Song
            .findOne({_id: id})
            .populate({
                path: 'album',
                // select: 'album',
            })
            .populate({
                path: 'artist',
                select: 'name'
            })

        if (!song) return res.json({
            error: 1,
            message: 'Song not found'
        })

        return res.json(song)

    } catch (err) {

        if (err && err.name === 'CastError'){
            return res.json({
                error: 1,
                message: 'Song not found'
            })
        }
        next(err)
    }
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

        let song = await Song.findOne({_id: id})

        if (!song){
            return res.json({
                error: 1,
                message: 'Song not found'
            })
        }
        let subjectSong = subject('Song', {...song, artist: song.artist});

        if(!policy.can('update', subjectSong)){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk mengupdate song'
            })
        }

        let payload = req.body;
        let user = req.user;

        payload.artist = user._id
        payload.downloaded = 0

        song = await Song.findOneAndUpdate({_id: id}, payload, { new: true})
        return res.json(song)

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
                message: 'Song not found',
            });
        }
        next(err)
    }
}

module.exports = {
    store,
    update,
    show,
    index
}