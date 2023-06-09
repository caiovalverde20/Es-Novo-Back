const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/, 'Formato de email inválido'],
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    token_list: {
        type: [String]
    },
    type: {
        type: String,
        enum: ['normal', 'adm', 'observer'],
        default: 'normal'
      },
    userFunction: {
        type: String,
        default: 'Membro'
      },
    code: {
        type: Number,
        required: false,
        default: null
    },
    profilePic: {
        url: {
            type: String,
            default: null
        },
        key: {
            type: String,
            default: null
        }
    },
},
    {
        timestamps: true,
    });

module.exports = model('User', UserSchema);