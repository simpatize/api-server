var router = require('express').Router();

router.get('/', function (req, res) {
  res.json({ message: 'Welcome to simpatize server API :)' });
});

module.exports = router;
