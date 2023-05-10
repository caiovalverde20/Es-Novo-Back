const JWT = require('jsonwebtoken');


module.exports = {

    signToken (user) {
        return JWT.sign({
            iss: 'esnovo',
            sub: user.id,
            iat: new Date().getTime(),
        }, process.env.JWT_SECRET);
    },

    async pushToken(user, token) {
        user.token_list.push(token);
        await user.save();
        user.token_list = undefined;
        user.password = undefined;
    }

}