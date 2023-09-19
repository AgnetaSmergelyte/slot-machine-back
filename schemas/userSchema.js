const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true,
        default: 100
    },
    games: {
        type: Number,
        required: true,
        default: 0
    },
    moneyLost: {
        type: Number,
        required: true,
        default: 0
    }
});

const user = mongoose.model("slots-users", userSchema);
module.exports = user;