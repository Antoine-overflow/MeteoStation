var express = require('express');
var router = express.Router();
var Influx = require('influx');

const listMeasure = {
    'temperature': 'temperature',
    'hygrometry': 'hygrometrie',
    'pressure': 'pression',
    'rainfall': 'precipitation',
    'brightness': 'luminosite',
    'winddirection': 'vent_direction',
    'windvelocity': 'vent',
    'gpsposition': 'gpsposition'
};

router.get('/', function (req, res, next) {
    res.render('API_documentation.html');
});

router.get('/:measure', function (req, res, next) {
    var measure = req.params.measure;
    var listParam = measure.split(",");
    var influx = createInflux();
    influx.query('select * from ' + measure + ' order by time desc LIMIT 1').then(result => {
        var a = {};
        for (var i = 0; i < listParam.length; i++) {
            if (result.groupRows[i].name == 'gpsposition') {
                a[result.groupRows[i].name] = {};
                a[result.groupRows[i].name].value = [result[i].lat, result[i].lon, result[i].alt];
                a[result.groupRows[i].name].date = result[i].date;
            } else if (result.groupRows[i].name == 'wind') {
                a[result.groupRows[i].name] = {};
                a[result.groupRows[i].name].value = [result[i].wind_avg, result[i].wind_min, result[i].wind_max];
                a[result.groupRows[i].name].date = result[i].date;
            } else {
                a[result.groupRows[i].name] = {};
                a[result.groupRows[i].name].value = [result[i].value];
                a[result.groupRows[i].name].date = result[i].date;
            }
        }
        res.send(a);
    }).catch(err => {
        res.status(500).send(err.stack)
    });
});

// router.get('/:measure', function(req, res, next) {
//     let listParam = req.params['measure'].split(',').map(elem => elem.toLowerCase());
//     //Creata an influx client using default db (express_response_db) for now
//     //Creata an influx client using default db (express_response_db) for now
//     const influx = createInflux();

//     let valeurs = {};
//     let allPromises = [];
//     listParam.forEach(param => {
//         valeurs[param] ={'date':[],'value':[]};
//         allPromises.push(
//         influx.query(
//             `select * from ${listMeasure[param]} ORDER BY time DESC LIMIT 1`
//         ))
//     });

//     Promise.all(allPromises)
//     .then(promises => {
//         i=0
//         promises.forEach(results=>{
//             if (listParam[i]=='windvelocity'){
//                 for (let index = 0; index < results.length; index++) {
//                     valeurs[listParam[i]]['value'].push({'min':results[index].vent_min,'avg':results[index].vent_moy, 'max':results[index].vent_max});
//                     valeurs[listParam[i]]['date'].push(results[index].date);
//                 }
//             }
//             else if (listParam[i]=='gpsposition'){
//                 for (let index = 0; index < results.length; index++) {
//                     valeurs[listParam[i]]['value'].push({'lon':results[index].est,'lat':results[index].nord});
//                     valeurs[listParam[i]]['date'].push(results[index].date);
//                 }
//             }
//             else{
//                 for (let index = 0; index < results.length; index++) {
//                     valeurs[listParam[i]]['value'].push(results[index].value);
//                     valeurs[listParam[i]]['date'].push(results[index].date);
//                 }
//             }

//             i+=1;
//             })
//             res.send(valeurs);
//     })

//     }); 

router.get('/:measure/:date', function (req, res, next) {
    var measure = req.params.measure;
    var list_measure = measure.split(",");
    var date = req.params.date;
    var influx = createInflux();
    if (date.split(",").length > 1) {
        var datedate1 = new Date(date.split(",")[0]);
        var time1 = datedate1.getTime() * 1000000;
        var datedate2 = new Date(date.split(",")[1]);
        var time2 = datedate2.getTime() * 1000000;
        influx.query('select * from ' + measure + ' where time> ' + time1 + ' and time<=' + time2).then(result => {
            var a = [];
            for (let i = 0; i < result.length; i++) {
                if (i % list_measure.length == 0) {
                    a.push({});
                }
                //a[a.length - 1][result.groupRows[i % list_measure.length].name] = "test";
                if (result.groupRows[i% list_measure.length].name == 'gpsposition') {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length]% list_measure.length.lat, result[i% list_measure.length].lon, result[i% list_measure.length].alt];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                } else if (result.groupRows[i% list_measure.length].name == 'wind') {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length].wind_avg, result[i% list_measure.length].wind_min, result[i% list_measure.length].wind_max];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                } else {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length].value];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                }
            }
            res.send(JSON.stringify(a));
        }).catch(err => {
            res.status(500).send(err.stack)
        });
    } else if (date.split(",").length == 1) {
        var datedate = new Date(date);
        var time = datedate.getTime() * 1000000;
        influx.query('select * from ' + measure + ' where time>' + time).then(result => {
            var a = [];
            for (let i = 0; i < result.length; i++) {
                if (i % list_measure.length == 0) {
                    a.push({});
                }
                //a[a.length - 1][result.groupRows[i % list_measure.length].name] = "test";
                if (result.groupRows[i% list_measure.length].name == 'gpsposition') {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length]% list_measure.length.lat, result[i% list_measure.length].lon, result[i% list_measure.length].alt];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                } else if (result.groupRows[i% list_measure.length].name == 'wind') {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length].wind_avg, result[i% list_measure.length].wind_min, result[i% list_measure.length].wind_max];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                } else {
                    a[a.length - 1][result.groupRows[i% list_measure.length].name] = {};
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].value = [result[i% list_measure.length].value];
                    a[a.length - 1][result.groupRows[i% list_measure.length].name].date = result[i% list_measure.length].date;
                }
            }
            res.send(JSON.stringify(a));
        }).catch(err => {
            res.status(500).send(err.stack)
        });
    }
});

// router.get('/:measure//startingDate', function(req, res, next) {
//     var measure = req.params.measure;
//     var influx = createInflux();
//     influx.query('select date from '+measure+' order by time LIMIT 1').then(result => {
//         res.send(result);
//       }).catch(err => {
//         res.status(500).send(err.stack)
//       });
// });

function createInflux() {
    const influx = new Influx.InfluxDB({
        host: 'localhost',
        database: 'meteodb'
    });
    return influx;
};

module.exports = router;