'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var status = require('http-status');
var request = require('supertest');
var path = require('path');
var helper = require(path.resolve('config/lib/test-helper'));
var app = require(path.resolve('server'));
var Place = require('./place.model');
var expect = chai.expect;
chai.use(chaiHttp);

describe('Routing', function () {
  describe('Places', function () {
    let url = '/v1/places/';

    afterEach(function (done) {
      helper.databaseCleaner.clean(done);
    });

    describe('/places', function () {

    });
  });
});
