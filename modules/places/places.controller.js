const Place = require('./place.model');

exports.list = function (req, res) {
  Place.find(function (err, places) {
    if (err)
      res.send(err);

    res.json(places);
  });
};
