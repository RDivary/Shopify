const { subject } = require('@casl/ability');

const config = require('../config')
const VoucherTopUp = require('../voucher-topup/model')
const Wallet = require('./model')
const WalletHistory = require('../wallet-history/model')

const User = require('../user/model')
const { policyFor } = require('../policy')

const topUp = async (req, res, next) => {

    try {

        let id = req.user._id;

        let { topUp } = req.body;

        let policy = policyFor(req.user)

        let user = await User.findOne({_id: id})

        let subjectUser = subject('Wallet', {...user, user: user?._id});

        if(!policy.can('topUp', subjectUser)){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk topup'
            })
        }

        if(topUp.length !== 19){
            return res.json({
                message: 'voucher tidak valid'
            })
        }

        let voucher = await VoucherTopUp.findOne({voucher: topUp})

        if (!voucher || voucher.isUse) {
            return res.json({
                message: 'voucher tidak valid'
            })
        }

        let wallet = await Wallet.findOne({user: user._id})
        let walletHistory = new WalletHistory({
            amount: voucher.nominal,
            type: 'TOPUP'
        })

        await User.findOneAndUpdate({_id: user._id}, {isActive: true})
        await VoucherTopUp.findOneAndUpdate({_id: voucher._id}, {isUse: true})
        await wallet.update({
            balance: wallet.balance + voucher.nominal,
            $push: {wallet_history: walletHistory}
            // wallet_history: wallet.wallet_history.push(walletHistory)
        })
        await walletHistory.save()

        return res.json({
            error: 0,
            message: 'Success top up',
            balance: wallet.balance + voucher.nominal
        })

    } catch (err) {
        next(err)
    }
}

module.exports = {
    topUp
}