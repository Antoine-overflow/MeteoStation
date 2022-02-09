function initMap(station_adress) {
    var map = L.map('map').setView([51.505, -0.09], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
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
        console.log("rotate("+Math.floor(t[t.length - 1].wind_heading)+"deg)");

        setTimeout(function(){
            updateRealTimeData(station_adress)
        }, 10000);

    }).catch(() => {console.log("Error")});

}

function loadPageStation(station_adress){
    initMap(station_adress);
    updateRealTimeData(station_adress);
}

loadPageStation("localhost:3000")
