var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/station/:id', function (req, res, next) {
    console.log(req.params.id);
    res.render('station.html', { title: 'Station 1' });
});

module.exports = router;