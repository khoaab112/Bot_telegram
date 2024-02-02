'use strict';
const dotenv = require('dotenv');
dotenv.config();
const { PORT, URL } = process.env;
const express = require('express')
const app = express()
    // var cors = require('cors');
    // app.use(cors());


app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.listen(PORT, function() {
    console.log(`Run : ${URL}:${PORT}`);
});