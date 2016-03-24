var places = require('./places.controller');
var router = require('express').Router();

router.route('/places')
  .get(places.list);

module.exports = router;
