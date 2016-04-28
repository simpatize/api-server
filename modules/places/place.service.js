'use strict';

var path = require('path');
var config = require(path.resolve('config/config'));
var GooglePlaces = require('googleplaces');

class PlaceService {
  constructor(googlePlaces) {
    if(!googlePlaces) {
      googlePlaces = new GooglePlaces(config.googlePlacesApiKey, config.googlePlacesOutputFormat);
    }

    this.googlePlaces = googlePlaces;
  }

  getPlaceDetails(placeid, callback){
    if (!placeid || placeid.trim() === '') {
      return callback(null, []);
    }
    
    this.googlePlaces.placeDetailsRequest({placeid: placeid}, (error, placeDetail) => {
        if (error) throw error;
        
        var promise = this._makeAPromiseToPlaceDetail(placeDetail);
      
        promise.then(
          function(place){
            callback(null, place);  
          },
          function(error){
            callback(error, null);
          }
        );
    });
  }
  
  _makeAPromiseToPlaceDetail(placeDetail){
    return new Promise((resolve, reject) => {
           var place = {
              'name': '',
              'photo': '',
              'address': '',
              'phone': ''
          }
    
          if(placeDetail.result != null){
              place.name = placeDetail.result.name;
              place.address = placeDetail.result.formatted_address;
              place.phone = placeDetail.result.formatted_phone_number;
            
              if(placeDetail.result.photos){
                var imageReference = {photoreference: placeDetail.result.photos[0].photo_reference};
                this.googlePlaces.imageFetch(imageReference, function(error, url) {
                  place.photo = !!error ? '' : url;
                  resolve(place);
                });
              }else{
              resolve(place);
            }
          }
          
            
        });
  }
  
  searchByKeyword (keyword, callback) {
    if (!keyword || keyword.trim() === '') {
      return callback(null, []);
    }

    let parameters = {
      location: [-8.0578381, -34.8828969],
      keyword: keyword,
      radius: 17000,
    };

    this.googlePlaces.nearBySearch(parameters,  (error, places) => {
      let placesPromises = places.results.map((p) => {
        return this._createPlacePromise(p);
      });

      Promise.all(placesPromises).then(function(places) {
        callback(null, places);
      }, function(error) {
        callback(error, null);
      });
    });
  }

  _createPlacePromise(rawPlace) {
    return new Promise((resolve, reject) => {
      let place = {};
      place.placeid = rawPlace.place_id;
      place.name = rawPlace.name;
      place.icon = rawPlace.icon;

      if (!rawPlace.photos) {
        place.thumbnailUrl = '';
        return resolve(place);
      } else {
        let imageFetchParameters = {
          photoreference: rawPlace.photos[0].photo_reference,
        }
        this.googlePlaces.imageFetch(imageFetchParameters, function(error, url) {
          place.thumbnailUrl = !!error ? '' : url;
          resolve(place);
        });
      }
    });
  }
  
}

module.exports = PlaceService;
