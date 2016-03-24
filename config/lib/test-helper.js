'use strict';

var mongoose = require('mongoose');
var requireDir = require('require-dir');
var DatabaseCleaner = require('database-cleaner');
var databaseCleaner = new DatabaseCleaner('mongodb');
var request = require('supertest');
var app = require('../../server');

exports.databaseCleaner = {
  clean: function (callback) {
    databaseCleaner.clean(mongoose.connections[0].db, callback);
  },
};
