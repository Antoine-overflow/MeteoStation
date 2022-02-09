var fs = require('fs');
var frequency = 1000;

// const Influx = require('influxdb-nodejs');
// const client = new Influx('http://127.0.0.1:8086/meteodb');

const Influx = require('influx');
const influx= new Influx.InfluxDB({
    host: 'localhost',
    database: 'meteodb',
    // port:8086,
    // schema: [
    //     {
    //         measurement: 'piensg30',
    //         fields: { temperature: Influx.FieldType.FLOAT, 
    //             pressure: Influx.FieldType.FLOAT, 
    //             humidity: Influx.FieldType.FLOAT, 
    //             luminosity: Influx.FieldType.FLOAT, 
    //             wind_heading: Influx.FieldType.FLOAT, 
    //             wind_speed_avg: Influx.FieldType.FLOAT,
    //             wind_speed_max: Influx.FieldType.FLOAT, 
    //             wind_speed_min: Influx.FieldType.FLOAT, 
    //             lat: Influx.FieldType.FLOAT,
    //             lon: Influx.FieldType.FLOAT,
    //             alt: Influx.FieldType.FLOAT,
    //         },
    //         tags: [ 'host' ]
    //     }
    // ]
});

function loop(){
    const promises = [];

    promises.push(new Promise((resolve, reject)=>{
        fs.readFile("/dev/shm/sensors", "utf8",function(err, res){
            if(err){
                return console.log(err);
            }
            // console.log(res);
            // var date = '';
            // for(var i=9; i<33; i++){
            //     if(i==19){date+=' '}
            //     else if(i==32){date+=''}
            //     else{date += res[i]}
            // }
            // var res2 = [];
            // for(var i=35; i<res.length;i++){
            //     res2[i-35]=res[i];
            // }
            // var res3 = '';
            // for(var i=0;i<res2.length;i++){
            //     res3 += res2[i];
            // }
            // res4 = '{"date":'+'"'+date+'"'+','+res3;
            // console.log(res4);
            // console.log(JSON.parse(res));
            // console.log(JSON.parse(res4));
            resolve(JSON.parse(res));
            // console.log(res);
        });
    }));

    promises.push(new Promise((resolve, reject)=>{
        fs.readFile("/dev/shm/gpsNmea", "utf8",function(err, res){
            if(err){
                return console.log(err);
            }
            var parsed = res.split(",");
            var lat = Math.floor(parsed[2]/100) + (parsed[2]-Math.floor(parsed[2]/100)*100)/60;
            var lon = Math.floor(parsed[4]/1000) + (parsed[4]-Math.floor(parsed[4]/1000)*1000)/60;
            var alt = parsed[11];

            // console.log(lat + " ### " + lon);
            res = '{"lat": '+lat+', "lon": '+lon+', "alt": '+alt+'}';

            resolve(JSON.parse(res));
        });
    }));

    // promises.push(new Promise((resolve, reject)=>{
    //     fs.readFile("/dev/shm/rainCounter.log", "utf8",function(err, res){
    //         if(err){
    //             return console.log(err);
    //         }
    //         console.log(res);
    //     })
    // }));

    Promise.all(promises).then(promises => {
        console.log('.');
        setTimeout(loop, 1000);
        influx.writePoints([
            {
                measurement: "temperature",
                fields: {date: promises[0].date, value: promises[0].measure[0].value},
            }
        ]);
        influx.writePoints([
            {
                measurement: "pressure",
                fields: {date: promises[0].date, value: promises[0].measure[1].value},
            }
        ]);
        influx.writePoints([
            {
                measurement: "humidity",
                fields: {date: promises[0].date, value: promises[0].measure[2].value},
            }
        ]);
        influx.writePoints([
            {
                measurement: "luminosity",
                fields: {date: promises[0].date, value: promises[0].measure[3].value},
            }
        ]);
        influx.writePoints([
            {
                measurement: "wind_heading",
                fields: {date: promises[0].date, value: promises[0].measure[4].value},
            }
        ]);
        influx.writePoints([
            {
              measurement: 'wind',
              fields: {date: promises[0].date, wind_avg: promises[0].measure[5].value, wind_min: promises[0].measure[6].value, wind_max: promises[0].measure[7].value}
            }
        ]);
        influx.writePoints([
            {
              measurement: 'gpsposition',
              fields: {date: promises[0].date, lat: promises[1].lat, lon: promises[1].lon, alt: promises[1].alt}
            }
        ]);
        
    });
}

loop();
console.log("You are now adding data to the database \n");
console.log("While you don't press CTRL + C data are added to the database every seconds");
