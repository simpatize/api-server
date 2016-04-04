'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var PlaceService = require('./place.service');
var googleMockedData = require('./googleMockedData')
var _ = require('lodash');

describe('PlaceService', function () {
  describe('searchByKeyword', function () {

    it('should fetch results from googleplaces and parse to domain model', function (done) {
      let keyword = 'Shopping';
      let invokedPhotoReferences = [];

      let googlePlacesMock = {
        nearBySearch: function (parameters, callback) {
          expect(parameters.keyword).to.equal(keyword);
          callback(null, googleMockedData);

        },
        imageFetch: function(parameters, callback) {
          invokedPhotoReferences.push(parameters.photoreference);
          callback(null, 'http://the-photo-url/file.jpg');
        }
      }

      let placeService = new PlaceService(googlePlacesMock);

      placeService.searchByKeyword(keyword, (error, places) => {
        let googleMockedDataPhotoReferences = googleMockedData.results.map((p) => p.photos[0].photo_reference);
        try {
          expect(invokedPhotoReferences).to.deep.equal(googleMockedDataPhotoReferences);
          expect(places[0]).to.deep.equal({
            name: 'Shopping Guararapes',
            thumbnailUrl: 'http://the-photo-url/file.jpg',
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
          });
          expect(places[1]).to.deep.equal({
            name: 'Shopping Recife',
            thumbnailUrl: 'http://the-photo-url/file.jpg',
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
          });

          done();
        } catch(e) {
          done(e);
        }
      });
    });

    context('when there is no photoreference for a place', function () {
      it('should set thumbnailUrl to an empty string', function (done) {
        let keyword = 'Shopping';
        let invokedPhotoReferences = [];
        let googlePlacesMock = {
          nearBySearch: function (parameters, callback) {
            let googleMockedDataWithoutPhoto = { results: [_.omit(googleMockedData.results[0],  ['photos']) ]};
            expect(parameters.keyword).to.equal(keyword);
            callback(null, googleMockedDataWithoutPhoto);
          },
          imageFetch: function(parameters, callback) {
            invokedPhotoReferences.push(parameters.photoreference);
            callback(null, 'http://the-photo-url/file.jpg');
          }
        }

        let placeService = new PlaceService(googlePlacesMock);

        placeService.searchByKeyword(keyword, function (error, places) {
          expect(places[0]).to.deep.equal({
            name: 'Shopping Guararapes',
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
            thumbnailUrl: '',
          });
          done();
        });
      });
    });


    context('when error occurs while fetching a picture for one place', function () {
      it('should set thumbnailUrl to an empty string', function (done) {
        let keyword = 'Shopping';
        let googlePlacesMock = {
          nearBySearch: function (parameters, callback) {
            expect(parameters.keyword).to.equal(keyword);
            callback(null, googleMockedData);
          },
          imageFetch: function(parameters, callback) {
            if(parameters.photoreference === googleMockedData.results[0].photos[0].photo_reference) {
              callback(null, 'http://the-photo-url/file.jpg')
            } else {
              callback(new Error());
            }
          }
        }

        let placeService = new PlaceService(googlePlacesMock);

        placeService.searchByKeyword(keyword, function (error, places) {
          try {
            expect(places[0]).to.deep.equal({
              name: 'Shopping Guararapes',
              icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',

              thumbnailUrl: 'http://the-photo-url/file.jpg',
            });
            expect(places[1]).to.deep.equal({
              name: 'Shopping Recife',
              icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
              thumbnailUrl: '',
            });
            done();
          } catch(e) {
            done(e);
          }
        });
      });
    });

    context('with a blank keyword argument', function () {
      let blankKeywords = ['', ' ', null, undefined];
      blankKeywords.forEach((keyword)=> {
      it('should return an empty array', function (done) {
          let googlePlacesMock = {
            nearBySearch: function (parameters, callback) {
              expect(parameters.keyword).to.equal(keyword);
              callback(null, googleMockedData);
            }
          }

          let placeService = new PlaceService(googlePlacesMock);

          placeService.searchByKeyword(keyword, function (error, places) {
            expect(places).to.deep.equal([]);
            done();
          });
        });
      });
    });
  });
})
