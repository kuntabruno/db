'use strict';
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const router = express.Router();
const Config = require('./config/index');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(bodyparser.json({ limit: '50MB'})); // for parsing application/json
app.use(bodyparser.urlencoded({ limit: '50MB', extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});
let options = {
    dotfiles: 'ignore',
    etag: false,
    // extensions: ['htm', 'html'],
    index: false,
    maxAge: '2d',
    redirect: false,
    setHeaders: (res, path, stat) => {
      res.set('x-timestamp', Date.now());
    }
  };
app.use(express.static('uploads', options));
require('./routes')(app, io);
/**
 * Connect to the database
 * @return {Object} Returns the connection object
 */
let boot = () => {
let dbConnect = () => {
    let db = mongoose.connect(Config.db, err => {
    if(err){
    console.log(`Failed to connect to db:  ${err}`)
    } else {
    console.log(`dBMeter service successfully connected to mongod instance`);
    startServer();
    }
    })
    mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
    });
    return db;
};
let startServer = () => {
    http.listen(Config.server.port, Config.server.host, () => {
    console.info(`dBMeter service listening on ${Config.server.host}: ${Config.server.port}`);
});
};
dbConnect();
};
boot();