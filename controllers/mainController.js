const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDb = require("../schemas/userSchema");

const resSend = (res, error, data, message) => {
    res.send({error, data, message});
}

const slotValues = ['seven', 'cherry', 'banana', 'watermelon', 'lemon', 'orange'];

function rnd(num) {
    return Math.floor(Math.random()*num);
}

function playSlotMachine(allMoney, bet) {
    let win = false;
    const bid = Number(bet);
    let payback = allMoney - bid;
    let winnings = 0;

    const slots = [
        slotValues[rnd(slotValues.length)],
        slotValues[rnd(slotValues.length)],
        slotValues[rnd(slotValues.length)],
    ]
    if (slots[0] === slots[1] && slots[0] === slots[2]) {
        win = true;
        if (slots[0] === 'seven') {
            winnings = bid * 100;
            payback += winnings;
        } else if (slots[0] === 'cherry') {
            winnings = bid * 30;
            payback += winnings;
        } else if (slots[0] === 'banana') {
            winnings = bid * 25;
            payback += winnings;
        } else if (slots[0] === 'watermelon') {
            winnings = bid * 20;
            payback += winnings;
        } else if (slots[0] === 'orange') {
            winnings = bid * 15;
            payback += winnings;
        } else if (slots[0] === 'lemon') {
            winnings = bid * 10;
            payback += winnings;
        }
    }
    return {slots, win, winnings, payback}
}

module.exports = {
    signup: async (req, res) => {
        const {username, password} = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = new userDb({
            username: username,
            password: hash,
        })
        try {
            await user.save();
            resSend(res, false, null, 'Registered');
        } catch (err) {
            resSend(res, true, null, 'Registration failed');
        }
    },
    login: async (req, res) => {
        const {username, password} = req.body;
        const userExists = await userDb.findOne({username});
        if (!userExists) {
            return resSend(res, true, null, 'User does not exist');
        } else {
            const isValid = await bcrypt.compare(password, userExists.password);
            if (!isValid) return resSend(res, true, null, 'Wrong password');
        }
        const user = {
            username,
            id: userExists._id,
        }
        const token = jwt.sign(user, process.env.JWT_SECRET);
        const myUser = {
            username,
            id: userExists._id,
            money: userExists.money
        }
        resSend(res, false, {user: myUser, token}, 'Logged in successfully');
    },
    getUser: async (req, res) => {
        const user = req.user;
        const userLegit = await userDb.findOne({_id: user.id});
        const myUser = {
            username: userLegit.username,
            id: userLegit._id,
            money: userLegit.money
        }
        resSend(res, false, myUser, '');
    },
    roll: async (req, res) => {
        const user = req.user;
        const userLegit = await userDb.findOne({_id: user.id});
        const {bet} = req.params;
        if (userLegit.money - Number(bet) < 0) return resSend(res, true, null, 'Not enough money');
        const data = playSlotMachine(userLegit.money, Number(bet));
        await userDb.findOneAndUpdate(
            {_id: user.id},
            {$set: {
                    money: data.payback,
                    games: userLegit.games + 1,
                    moneyLost: userLegit.moneyLost + userLegit.money - data.payback }},
            {new: true}
        )
        resSend(res, false, data, '');
    },
    getPlayersByMostMoney: async (req, res) => {
        const data = await userDb.find().sort({money: -1});
        const users = [];
        data.map(x => users.push({username: x.username, games: x.games, money: x.money}));
        resSend(res, false, users, '');
    },
    getPlayersByLostMoney: async (req, res) => {
        const data = await userDb.find().sort({moneyLost: -1});
        const users = [];
        data.map(x => users.push({username: x.username, games: x.games, money: x.moneyLost}));
        resSend(res, false, users, '');
    }
}