'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var sinon = require('sinon');
var status = require('http-status');
var request = require('supertest');
var path = require('path');
var app = require(path.resolve('server'));
var googleMockedData = require('./googleMockedData');
var nock = require('nock');

chai.use(chaiHttp);

describe('Routing', function () {
  describe('Places', function () {


    describe('/places GET', function () {
      let url = '/v1/places';
      context('with non-empty keyword query string', function () {
        let keyword = 'shopping'

        it('should return a list of places', function (done) {
          let nearbySearchPattern = new RegExp('maps/api/place/nearbysearch/json\?.*keyword='+ keyword +'.*');
          let imageFetchPattern = new RegExp('maps/api/place/photo\?.*photoreference=.*');

          nock('https://maps.googleapis.com')
          .get(nearbySearchPattern)
          .reply(status.OK, googleMockedData)
          .get(imageFetchPattern)
          .reply(status.FOUND, 'Just a redirect to the photo', {
              Location: 'http://myimageurl/file.jpg'
          });

          request(app)
          .get(url + '?keyword=' + keyword)
          .end(function (err, res) {
            expect(err).to.not.exist;
            expect(res).to.have.status(status.OK);
            expect(res.body[0]).to.deep.equal({
              name: 'Shopping Guararapes',
              thumbnailUrl: 'http://myimageurl/file.jpg',
              icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png'
            });

            done();
          });
        });
      });

      context('with empty keyword query string', function () {
        let keyword = ''

        it('should return an empty list of places', function (done) {
          let pattern = 'maps/api/place/nearbysearch/json\?.*keyword='+ keyword + '($|\&.*)'

          nock('https://maps.googleapis.com')
          .get(new RegExp(pattern))
          .reply(status.OK, googleMockedData);

          request(app)
          .get(url + '?keyword=' + keyword)
          .end(function (err, res) {
            expect(err).to.not.exist;
            expect(res).to.have.status(status.OK);
            expect(res.body).to.deep.equal([]);

            done();
          });
        });
      });
    });
  });
});
