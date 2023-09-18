const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./router/mainRouter");
const mongoose = require("mongoose");

require("dotenv").config()

mongoose.connect(process.env.DB_KEY)
    .then(() => {
        console.log('connection success')
    }).catch(w => {
    console.log('ERROR', e)
})

app.use(cors());
app.use(express.json());
app.use("/", router);

const port = 8080;

app.listen(port);