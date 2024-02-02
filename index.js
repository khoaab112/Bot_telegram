'use strict';
const chatController = require("./controller/chatController");
const dotenv = require('dotenv');
dotenv.config();
const { PORT, URL, TOKEN_TELEGRAM } = process.env;
const express = require('express')
const app = express()

chatController.byKeyword();
chatController.receiveAll();

app.listen(PORT, function() {
    console.log(`Run : ${URL}:${PORT}`);
});