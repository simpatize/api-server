'use strict';

var PlaceService = require('./place.service');
var placeService = new PlaceService();

exports.list = function (req, res) {
  let keyword = req.query.keyword;

  placeService.searchByKeyword(keyword, function (error, places) {
    if (error) throw error;
    res.json(places);
  });
};
