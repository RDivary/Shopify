const { AbilityBuilder, Ability} = require('@casl/ability')

const policies = {

    guest(user, {can}){

        can('view', 'Genre');

    },

    user(user, {can}){

        can('view', 'Genre');

        can('topUp', 'Wallet', {user: user._id});

        can('buy', 'Transaction');

    },

    artist(user, {can}){

        can('create', 'Song');
        can('update', 'Song', {artist: user._id});

        can('create', 'Album');
        can('update', 'Album', {artist: user._id});

        can('view', 'Genre');


    },

    admin(user, {can}){

        can('manage', 'Genre');
        can('generatedVoucher', 'voucherTopUp');

    }

}

const policyFor = (user) => {

    let builder = new AbilityBuilder();

    if(user && typeof policies[user.role] === "function"){
        policies[user.role](user, builder);
    } else {
        policies["guest"](user, builder)
    }

    return new Ability((builder.rules))
}

module.exports = {
    policyFor
}