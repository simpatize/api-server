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
