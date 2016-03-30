'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config/config');
var routes = require('./config/lib/routes');
var cors = require('cors');

var app = express();
var port = process.env.PORT || 3000;

mongoose.connect(config.db.mongodb);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/v1', routes);
app.listen(port);

console.log(`simpatize server is running on port ${port} in ${process.env.NODE_ENV} mode`);

module.exports = app;
