'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var PlaceService = require('./place.service');
var googleMockedData = require('./googleMockedData')

describe('PlaceService', function () {
  describe('searchByKeyword', function () {

    it('should fetch results from googleplaces and parse to domain model', function (done) {
      let keyword = 'Shopping';
      let googlePlacesMock = {
        nearBySearch: function (parameters, callback) {
          expect(parameters.keyword).to.equal(keyword);
          callback(null, googleMockedData);
        }
      }

      let placeService = new PlaceService(googlePlacesMock);

      placeService.searchByKeyword(keyword, function (error, places) {
        expect(places[0]).to.deep.equal({name: 'Shopping Guararapes'});
        done();
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
