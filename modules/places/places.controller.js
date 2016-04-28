'use strict';

var PlaceService = require('./place.service');
var placeService = new PlaceService();

exports.list = function (req, res) {
  let keyword = req.query.keyword;
  let reference = req.query.reference;
  
  if(keyword != undefined){
      placeService.searchByKeyword(keyword, function (error, places) {
        if (error) throw error;
        res.json(places);
      });
  }
  
  if(reference != undefined){
    placeService.getPlaceDetails(reference, function(error, place){
      if (error) throw error;
      res.json(place);
    });
  }  
};
