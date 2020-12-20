const mongoose = require('mongoose');

const Transaction = require('./model')
const { policyFor } = require('../policy')
const User = require('../user/model')
const Wallet = require('../wallet/model')
const Song = require('../song/model')
const Album = require('../album/model')
const TransactionDetail = require('../transaction-detail/model')
const WalletHistory = require('../wallet-history/model')

const transaction = async (req, res, next) => {

    try {

        let payload = req.body;

        let policy = policyFor(req.user)

        if(!policy.can('buy', 'Transaction')){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk transaksi'
            })
        }

        let user = await User.findOne({_id: req.user._id})

        if (!user.isActive){
            return res.json({
                error: 1,
                message: 'Akun anda belom aktif, silahkan lakukan topup terlebih dahulu'
            })
        }

        let wallet = await Wallet.findOne({user: user._id}).select('-wallet_history -transaction')

        if (payload.song){

            let song = await Song.findOne({_id: payload.song})

            if (!song) {
                return res.json({
                    error: 1,
                    message: `Song not found`
                })
            }

            let checkedSong = user.songs.filter((haveASong) => haveASong._id.toString() === song._id.toString())

            if (checkedSong.length !== 0)
                return res.json({
                    error: 1,
                    message: `anda sudah memiliki lagi berjudul ${song.title}`
                })

            if (song.price > wallet.balance){
                return res.json({
                    error: 1,
                    message: 'uang anda tidak cukup'
                })
            }

            let transactionDetail = new TransactionDetail({
                song: song._id,
                price: song.price,
                transaction: new mongoose.Types.ObjectId(),
            })

            let transaction = new Transaction({
                wallet: wallet._id,
                transaction_detail: [transactionDetail]
            })

            let walletHistory = new WalletHistory({
                amount: song.price,
                type: 'PAYMENT'
            })

            Promise.all([

                await wallet.update({
                    balance: wallet.balance - song.price,
                    $push: {transaction, wallet_history: walletHistory}
                }),
                await User.findOneAndUpdate({
                        _id: user._id
                    },
                    {
                        $push: {songs: song._id}
                    }),
                await walletHistory.save(),
                await transactionDetail.save({
                    transaction: transaction._id
                }),
                transaction = await transaction.save(),
                await song.update({
                    downloaded: song.downloaded + 1
                })

            ])

            return res.json({
                message: 'Bought successfully',
                song: song.title,
                balance: wallet.balance - song.price,
                transaction,
            });

        } else if (payload.album){

            let album = await Album.findOne({_id: payload.album})

            if (!album) {
                return res.json({
                    error: 1,
                    message: `Album not found`
                })
            }

            let checkedAlbum = user.albums.filter((haveAnAlbum) => haveAnAlbum._id.toString() === album._id.toString())

            if (checkedAlbum.length !== 0)
            return res.json({
                error: 1,
                message: `anda sudah memiliki album ${album.album}`
            })

            let transactionDetail = []
            let songNotFound = false

            let filterSong = []

            album.songs.map(async (albumSong,) => {
                let checkedSong = user.songs.find((userSong) => userSong.toString() === albumSong.toString())
                if (checkedSong === undefined) {
                    filterSong.push(albumSong.toString())
                }
            })

            let idTransaction = new mongoose.Types.ObjectId()

            for (let i = 0; i < filterSong.length; i++){
                let checkedSong = await Song.findOne({_id: filterSong[i]})
                if (checkedSong === null){
                    songNotFound = true
                    break
                }
                transactionDetail.push(
                    new TransactionDetail({
                        song: checkedSong._id,
                        price: checkedSong.price,
                        transaction: idTransaction
                    }))
            }

            if (songNotFound) {
                return res.json({
                    error: 1,
                    message: `Song not found`
                })
            }

            let sum = transactionDetail.reduce((sum, item) => sum += (item.price),0)

            if (sum > wallet.balance){
                return res.json({
                    error: 1,
                    message: 'uang anda tidak cukup'
                })
            }

            let transaction = new Transaction({
                _id: idTransaction,
                album: payload.album,
                wallet: wallet._id,
                transaction_detail: transactionDetail
            })

            let walletHistory = new WalletHistory({
                amount: sum,
                type: 'PAYMENT'
            })

            Promise.all([

                await wallet.update({
                    balance: wallet.balance - sum,
                    $push: {transaction, wallet_history: walletHistory}
                }),
                await User.findOneAndUpdate({
                        _id: user._id
                    },
                    {
                        $push: {songs: transactionDetail.map((detail) => detail.song), albums: album._id}
                    }),
                await transactionDetail.map((item) => {
                    return item.save()
                }),

                transaction = await transaction.save(),

                await walletHistory.save(),

                await transactionDetail.map(async (transaction) => {
                    let song = await Song.findOne({_id: transaction.song})
                    await Song.findOneAndUpdate({
                        _id: transaction.song
                    }, {
                        downloaded: song.downloaded + 1
                    })
                }),
            ])

            return res.json({
                message: 'Bought album successfully',
                album: album.album,
                balance: wallet.balance - sum,
                transaction,
            });
        }

        return res.json({
            message: 'yey'
        })

    } catch (err) {

        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }

}

module.exports = {
    transaction
}