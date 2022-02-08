var fs = require('fs');
var frequency = 1000;

// const Influx = require('influxdb-nodejs');
// const client = new Influx('http://127.0.0.1:8086/meteodb');

const Influx = require('influx');
const influx= new Influx.InfluxDB({
    host: 'localhost',
    database: 'meteodb',
    port:8086,
    schema: [
        {
            measurement: 'piensg30',
            fields: { temperature: Influx.FieldType.FLOAT, 
                pressure: Influx.FieldType.FLOAT, 
                humidity: Influx.FieldType.FLOAT, 
                luminosity: Influx.FieldType.FLOAT, 
                wind_heading: Influx.FieldType.FLOAT, 
                wind_speed_avg: Influx.FieldType.FLOAT,
                wind_speed_max: Influx.FieldType.FLOAT, 
                wind_speed_min: Influx.FieldType.FLOAT, 
                lat: Influx.FieldType.FLOAT,
                lon: Influx.FieldType.FLOAT,
                alt: Influx.FieldType.FLOAT,
            },
            tags: [ 'host' ]
        }
    ]
});

function loop(){
    const promises = [];

    promises.push(new Promise((resolve, reject)=>{
        fs.readFile("/dev/shm/sensors", "utf8",function(err, res){
            if(err){
                return console.log(err);
            }
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
        // console.log(promises);
        setTimeout(loop, 1000);
        // console.log(promises[1]);
        influx.writePoints([
            {
                measurement: "piensg30",
                time: promises[0].date,
                fields:{
                    temperature: promises[0].measure[0].value,
                    pressure: promises[0].measure[1].value,
                    humidity: promises[0].measure[2].value,
                    luminosity:promises[0].measure[3].value, 
                    wind_heading: promises[0].measure[4].value, 
                    wind_speed_avg: promises[0].measure[5].value, 
                    wind_speed_max: promises[0].measure[6].value, 
                    wind_speed_min: promises[0].measure[7].value,
                    lat: promises[1].lat,
                    lon: promises[1].lon,
                    alt: promises[1].alt
                }
            }
        ]);
    });
}

loop();
