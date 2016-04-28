'use strict';

var PlaceService = require('./place.service');
var placeService = new PlaceService();

exports.list = function (req, res) {
  let keyword = req.query.keyword;
  let placeid = req.query.placeid;
  
  if(keyword != undefined){
      placeService.searchByKeyword(keyword, function (error, places) {
        if (error) throw error;
        res.json(places);
      });
  }
  
  if(placeid != undefined){
    placeService.getPlaceDetails(placeid, function(error, place){
      if (error) throw error;
      res.json(place);
    });
  }  
};
