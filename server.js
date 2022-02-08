var fs = require('fs');
var frequency = 1000;

function loop(){
    const promises = [];

    promises.push(new Promise((resolve, reject)=>{
        fs.readFile("/dev/shm/sensors", "utf8",function(err, res){
            if(err){
                return console.log(err);
            }
            resolve(JSON.parse(res));
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

            // console.log(lat + " ### " + lon);
            res = '{"lat": '+lat+', "lon": '+lon+'}';

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
        console.log(promises);
        setTimeout(loop, 1000);
    });
}

loop();
