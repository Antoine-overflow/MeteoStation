var express = require('express');
var router = express.Router();
var Influx = require('influx');

router.get('/', function(req, res, next) {
   res.render('API_documentation.html');
});

router.get('/:measure', function(req, res, next) {
    var measure = req.params.measure;
    var influx = createInflux();
    influx.query('select * from '+measure+' order by time desc LIMIT 1').then(result => {
        res.send(result);
      }).catch(err => {
        res.status(500).send(err.stack)
      });
});

router.get('/:measure/:date', function(req, res, next) {
    var measure = req.params.measure;
    console.log(measure);
    var date = req.params.date;
    console.log(date);
    // parsedDate = date.parse(',');
    // if(parsedDate.length == 1){
    //     date = new Date(date);
    //     console.log(date);
    //     var influx = createInflux();
    //     influx.query('select '+measure+' from piensg30 where time').then(result => {
    //         res.send(result);
    //     }).catch(err => {
    //         res.status(500).send(err.stack)
    //   });
    // }
});

function createInflux(){
    const influx = new Influx.InfluxDB({
        host: 'localhost',
        database: 'meteodb'
    });
    return influx;
};

module.exports = router;