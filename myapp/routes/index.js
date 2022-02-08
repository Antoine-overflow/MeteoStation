function getLiStations(stations) {
  var html = "<li><a href='/'>All Stations</a></li>";
  stations.forEach(station => {
    html += "<li><a href='/station/"+station.id+"'>Station "+station.id+"</a></li>";
  });
  return html;
}





var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // A modifier plus tard
  var stations = [{ id: 1, address: "" }]

  res.render('index.html', {
    title: 'DashBoard pour station météo',
    stations: {
      values: stations,
      li: getLiStations(stations),
      nb: stations.length
    }
  });
});

module.exports = router;