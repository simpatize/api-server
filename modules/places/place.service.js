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

    this.googlePlaces.nearBySearch(parameters, function (error, places) {
      let domainPlaces = places.results.map((p) => {
        return {
          name: p.name
        }
      });
      callback(error, domainPlaces);
    });
  }

}

module.exports = PlaceService;
