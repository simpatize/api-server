'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var PlaceService = require('./place.service');
var googleMockedData = require('./mocked_data/googleMockedData');
var googleDetailsMockedData = require('./mocked_data/googleDetailsMockedData');
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
            placeid: 'ChIJp18-77nhqgcRxiSziGKAXNU',
            name: 'Shopping Guararapes',
            thumbnailUrl: 'http://the-photo-url/file.jpg',
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',
          });
          expect(places[1]).to.deep.equal({
            placeid: 'ChIJp18-77nhqgcRxiSziGKAXN2',
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
            placeid: 'ChIJp18-77nhqgcRxiSziGKAXNU',
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
              "placeid": "ChIJp18-77nhqgcRxiSziGKAXNU",
              name: 'Shopping Guararapes',
              icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png',

              thumbnailUrl: 'http://the-photo-url/file.jpg',
            });
            expect(places[1]).to.deep.equal({
              placeid: 'ChIJp18-77nhqgcRxiSziGKAXN2',
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
  
  describe('getPlaceDetails', function(){
    it('should return a place information', function(done){
      let invokedPhotoReferences = [];
      let placeid = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      let googlePlacesMock = {
          placeDetailsRequest: function (parameters, callback) {
            expect(parameters.placeid).to.equal(placeid);
            callback(null, googleDetailsMockedData);
          },
          imageFetch: function(parameters, callback) {
            invokedPhotoReferences.push(parameters.photoreference);
            callback(null, 'http://myimageurl/file.jpg');
          }
      }
      
      let placeService = new PlaceService(googlePlacesMock);
      
      placeService.getPlaceDetails(placeid, function (error, details) {
        if(error) console.log(error);
        try{
          expect(invokedPhotoReferences[0]).to.deep.equal(googleDetailsMockedData.result.photos[0].photo_reference);
          expect(details).to.deep.equal({
          'name': 'Siri Cascudo',
          'photo': 'http://myimageurl/file.jpg',
          'address': 'Av. Herculano Bandeira, 785, Pina',
          'phone': '558112345678'
          });
          done();
        }catch(e){
          done(e);
        }
      });
    });
    
    it('should return a empty place information when google api returns none results', function(done){
      let placeid = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      let googlePlacesMock = {
          placeDetailsRequest: function (parameters, callback) {
            expect(parameters.placeid).to.equal(placeid);
            callback(null, {"html_attributions" : [],
                            "result" : null
                           }
                    );
          },
          imageFetch: function(parameters, callback) {
            invokedPhotoReferences.push(parameters.photoreference);
            callback(null, 'http://myimageurl/file.jpg');
          }
      }
      
      let placeService = new PlaceService(googlePlacesMock);
      
      placeService.getPlaceDetails(placeid, function (error, details) {
        if(error) console.log(error);
        try{
          expect(details).to.deep.equal({
          'name': '',
          'photo': '',
          'address': '',
          'phone': ''
          });
          done();
        }catch(e){
          done(e);
        }
      });
    });
    
    let blankPlaceid = ['', ' ', null, undefined];
    blankPlaceid.forEach((placeid)=> {
    it('should return an empty array', function (done) {
        let googlePlacesMock = {
          placeDetailsRequest: function (parameters, callback) {
            expect(parameters.placeid).to.equal(placeid);
            callback(null, googleDetailsMockedData);
          }
        }

        let placeService = new PlaceService(googlePlacesMock);

        placeService.getPlaceDetails(placeid, function (error, details) {
          expect(details).to.deep.equal([]);
          done();
        });
      });
    });
   });
  
    context('when there is no photoreference for a place', function () {
      it('should set photo to an empty string', function (done) {
        let placeid = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
        let invokedPhotoReferences = [];
        let googlePlacesMock = {
          placeDetailsRequest: function (parameters, callback) {
            let googleMockedDataWithoutPhoto = { result: _.omit(googleDetailsMockedData.result,  'photos') };
            expect(parameters.placeid).to.equal(placeid);
            callback(null, googleMockedDataWithoutPhoto);
          },
          imageFetch: function(parameters, callback) {
            invokedPhotoReferences.push(parameters.photoreference);
            callback(null, 'http://myimageurl/file.jpg');
          }
        }

        let placeService = new PlaceService(googlePlacesMock);

        placeService.getPlaceDetails(placeid, function (error, details) {
          if(error) console.log(error);
          try{
            expect(details).to.deep.equal({
            'name': 'Siri Cascudo',
            'photo': '',
            'address': 'Av. Herculano Bandeira, 785, Pina',
            'phone': '558112345678'
            });
            done();
          }catch(e){
            done(e);
          }
      });
      });
    });
    
});
