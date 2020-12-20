const Artist = require('../artist/model')

const index = async (req, res, next) => {

    let { limit = 10, skip = 0, name = ''} = req.query

    let count = await Artist.find({name: {$regex: name, $options: 'i'}}).countDocuments()

    let artist = await Artist.find({name: {$regex: name, $options: 'i'}})
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('album')
        .select('album isActive gender _id name debut')

    return res.json({
        data: artist,
        count
    })
}

module.exports = {
    index
}