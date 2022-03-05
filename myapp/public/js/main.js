function initMap(station_adress) {
    var map = L.map('map').setView([51.505, -0.09], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true
    }).addTo(map);

    // Add a marker where the station is
    fetch("http://" + station_adress + "/data/gpsposition").then(g => g.json()).then(g => {
        let marker = L.marker([g.gpsposition.value[0],g.gpsposition.value[1]]).addTo(map);
        marker.bindPopup("<b>Station Météo X</b><br>Adress: " + station_adress + "</br><br>Coords: "+g.gpsposition.value[0]+" , " + g.gpsposition.value[1]+"</br>");

        map.setView([g.gpsposition.value[0],g.gpsposition.value[1]], 10);
    });
}


function updateRealTimeData(station_adress){
    // Get all the container
    var c_temperature = document.getElementById("temperature_in_real_time_text");
    var c_humidity = document.getElementById("humidity_in_real_time_text");
    var c_pressure = document.getElementById("pressure_in_real_time_text");
    var c_wind = document.getElementById("speed_wind_in_real_time_text");
    var i_wind = document.getElementById("direction_wind_in_real_time_img");

    // Get the data
    fetch("http://"+station_adress+"/data/temperature,humidity,wind,pressure,wind_heading").then(t => t.json()).then(t => {
        c_temperature.innerText = t.temperature.value[0] + "°C";
        c_humidity.innerText = t.humidity.value[0] + "%";
        c_pressure.innerText = Math.floor(t.pressure.value[0]) + "hPa";
        c_wind.innerText = Math.floor(t.wind.value[0]) + "K/s";
        i_wind.style.transform = "rotate("+Math.floor(t.wind_heading.value[0])+"deg)";

        setTimeout(function(){
            updateRealTimeData(station_adress)
        }, 10000);

    }).catch(() => {console.log("Error")});

}

function drawBigGraphic(station_adress){
    // get period
    var period = {};
    document.querySelectorAll(".select-temporaly-big-graph").forEach(element => {
        if (element.checked) {
            period.request = element.value;
        }
    });

    // remove canvas
    document.getElementById('big-station-graph').remove();
    document.getElementById('graph-div').innerHTML = "<canvas id='big-station-graph'></canvas>"
    
    // Get the date
    let now = new Date().toISOString();
    let delta = "2022-03-05T15:54:31.069Z";
    if (period.request == "All"){
        delta = new Date("2022-03-05T15:54:31.069Z").toISOString();
    }

    if (period.request == "Month") {
        delta = new Date();
        delta.setDate(delta.getDate() - 31);
        delta = delta.toISOString();
    }

    if (period.request == "Week") {
        delta = new Date();
        delta.setDate(delta.getDate() - 7);
        delta = delta.toISOString();
    }

    if (period.request == "Day") {
        delta = new Date();
        delta.setDate(delta.getDate() - 1);
        delta = delta.toISOString();
    }

    // get the measure
    let measures = [];
    document.querySelectorAll(".select-data-big-graph").forEach(element => {
        if (element.checked) {
            measures.push(element.value);
        }
    })
    

    // get the data
    fetch("http://"+station_adress+"/data/"+measures.join(",")+"/" + delta).then(d => d.json()).then(d => {
        // TAke all the date
        const date = [];
        const data_measures = {
            "temperature":[],
            "humidity":[],
            "luminosity":[],
            "pressure":[],
            "wind":[]
        };

        // Put prettier value in array
        d.forEach(m => {
            date.push(m[measures[0]].date);
            measures.forEach(type => {
                data_measures[type].push(m[type].value[0]);
            });
        });
        

        const temperature_dataset = {
            label: "Temperature (°C)",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: data_measures["temperature"]
        }

        const humidity_dataset = {
            label: "Humidity (%)",
            backgroundColor: 'rgb(98, 209, 43)',
            borderColor: 'rgb(98,209,43)',
            data: data_measures["humidity"]
        }

        const luminosity_dataset = {
            label: "Luminosity (Lux)",
            backgroundColor: 'rgb(255,182,77)',
            borderColor: 'rgb(255,182,77)',
            data: data_measures["luminosity"]
        }

        const pressure_dataset = {
            label: "Pressure (hPa)",
            backgroundColor: 'rgb(38,218,210)',
            borderColor: 'rgb(38,218,210)',
            data: data_measures["pressure"]
        }

        const wind_dataset = {
            label: "Wind speed K/s",
            backgroundColor: 'rgb(180,180,180)',
            borderColor: 'rgb(180,180,180)',
            data: data_measures["wind"]
        }

        let datasets = [];
        measures.forEach(m => {
            if (m == "temperature") {
                datasets.push(temperature_dataset);
            }
            if (m == "humidity") {
                datasets.push(humidity_dataset);
            }
            if (m == "luminosity") {
                datasets.push(luminosity_dataset);
            }
            if (m == "pressure") {
                datasets.push(pressure_dataset);
            }
            if (m == "wind") {
                datasets.push(wind_dataset);
            }
        })

        const data = {
            labels: date,
            datasets: datasets
        }
        
          const config = {
            type: 'line',
            data: data,
            options: {}
          };

          const myChart = new Chart(
            document.getElementById('big-station-graph'),
            config
          );
    });
}

function manageTimePeriod(station_adress){
    document.querySelectorAll('.select-temporaly-big-graph').forEach(b => {
        b.addEventListener("click", e => {
            document.querySelectorAll('.select-temporaly-big-graph').forEach(radio => {
                radio.checked = false;
            });
            e.currentTarget.checked = true;
            drawBigGraphic(station_adress);
        });
    });
}

function manageDataGraph(station_adress){
    document.querySelectorAll('.select-data-big-graph').forEach(b => {
        b.addEventListener('click', e => {
            drawBigGraphic(station_adress);
        });
    });
}


function loadPageStation(station_adress){
    initMap(station_adress);
    updateRealTimeData(station_adress);
    drawBigGraphic(station_adress);
    manageTimePeriod(station_adress);
    manageDataGraph(station_adress);
}

loadPageStation("localhost:3000")
