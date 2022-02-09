function initMap(station_adress) {
    var map = L.map('map').setView([51.505, -0.09], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true
    }).addTo(map);
}


function updateRealTimeData(station_adress){
    // Get all the container
    var c_temperature = document.getElementById("temperature_in_real_time_text");
    var c_humidity = document.getElementById("humidity_in_real_time_text");
    var c_pressure = document.getElementById("pressure_in_real_time_text");
    var c_wind = document.getElementById("speed_wind_in_real_time_text");
    var i_wind = document.getElementById("direction_wind_in_real_time_img");

    // Get the data
    fetch("http://"+station_adress+"/data/temperature,humidity,pressure,wind_speed_avg,wind_heading").then(t => t.json()).then(t => {
        c_temperature.innerText = t[t.length - 1].temperature + "°C";
        c_humidity.innerText = t[t.length - 1].humidity + "%";
        c_pressure.innerText = Math.floor(t[t.length - 1].pressure) + "hPa";
        c_wind.innerText = Math.floor(t[t.length - 1].wind_speed_avg) + "K/s";
        i_wind.style.transform = "rotate("+Math.floor(t[t.length - 1].wind_heading)+"deg)";

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
    // get the data
    fetch("http://"+station_adress+"/data/").then(d => d.json()).then(d => {
        // TAke all the date
        const date = [];
        const temperature = [];
        const humidity = [];
        const luminosity = [];
        const pressure = [];

        // Put prettier value in array
        d.forEach(m => {
            date.push(m.time);
            temperature.push(m.temperature);
            humidity.push(m.humidity);
            luminosity.push(m.luminosity);
            pressure.push(m.pressure);
        });
        

        const temperature_dataset = {
            label: "Temperature (°C)",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: temperature
        }

        const humidity_dataset = {
            label: "Humidity (%)",
            backgroundColor: 'rgb(98, 209, 43)',
            borderColor: 'rgb(98,209,43)',
            data: humidity
        }

        const luminosity_dataset = {
            label: "Luminosity (Lux)",
            backgroundColor: 'rgb(255,182,77)',
            borderColor: 'rgb(255,182,77)',
            data: luminosity
        }

        const pressure_dataset = {
            label: "Pressure (hPa)",
            backgroundColor: 'rgb(38,218,210)',
            borderColor: 'rgb(38,218,210)',
            data: pressure
        }

        const data = {
            labels: date,
            datasets: [temperature_dataset, humidity_dataset, luminosity_dataset, pressure_dataset]
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


function loadPageStation(station_adress){
    initMap(station_adress);
    updateRealTimeData(station_adress);
    drawBigGraphic(station_adress, "All");
    manageTimePeriod(station_adress);
}

loadPageStation("localhost:3000")
