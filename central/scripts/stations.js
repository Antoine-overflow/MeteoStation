function generateStations(key) {
    console.log("STATION");

    if (key == undefined) { return; }

    let element = document.getElementById('dash');
    element.innerHTML = "";

    // struct the page
    let html = "<div id='station-rti-css-grids'></div><div id='graph'></div><div id='station_map'></div>";
    element.innerHTML = html;

    // add rti
    html = "";
    html += "<div id='rti-temperature' class='rti'><img src='media/img/temperature.png'><div><h3 id='rti-temperature-text'>XX</h3><p>°C</p></div></div>";
    html += "<div id='rti-humidity' class='rti'><img src='media/img/humidity.png'><div><h3 id='rti-humidity-text'>XX</h3><p>%</p></div></div>";
    html += "<div id='rti-pressure' class='rti'><img src='media/img/pressure.png'><div><h3 id='rti-pressure-text'>XX</h3><p>hPa</p></div></div>";
    html += "<div id='rti-wind' class='rti'><img src='media/img/wind.png'><div><h3 id='rti-wind-text'>XX</h3><p>K/s</p></div></div>";

    document.getElementById("station-rti-css-grids").innerHTML = html;

    ADRESS = STATIONS[key].adresse;
    getRTI();


    // CHART
    html = "";
    html = "<div id='chart'><canvas id='big-station-graph'></canvas></div><div id='config-chart'></div>";
    document.getElementById("graph").innerHTML = html;

    html = '<h4>SandBox:</h4><p>Period:</p><div id="select-temporality-big-graph"><form><input type="radio" class="select-temporaly-big-graph" value="All" checked><label for="All" style="margin-right: 10px;">All</label><input type="radio" class="select-temporaly-big-graph" value="Month"><label for="Month" style="margin-right: 10px;">Month</label><input type="radio" class="select-temporaly-big-graph" value="Week"><label for="Week" style="margin-right: 10px;">Week</label><input type="radio" class="select-temporaly-big-graph" value="Day"><label for="Day" style="margin-right: 10px;">Day</label></form></div><p>Data:</p><div id="select-data-big-graph"><input type="checkbox" class="select-data-big-graph" value="temperature" checked><label for="temperature" style="margin-right: 10px;">Temperature</label><div></div><input type="checkbox" class="select-data-big-graph" value="humidity"><label for="humidity" style="margin-right: 10px;">Humidity</label><div></div><input type="checkbox" class="select-data-big-graph" value="luminosity"><label for="luminosity" style="margin-right: 10px;">Luminosity</label><div></div><input type="checkbox" class="select-data-big-graph" value="wind"><label for="wind" style="margin-right: 10px;">Wind Speed</label><div></div><input type="checkbox" class="select-data-big-graph" value="pressure"><label for="pressure" style="margin-right: 10px;">Pressure</label></div>';
    document.getElementById("config-chart").innerHTML = html;

    manageDataGraph();
    manageTimePeriod();

    drawBigGraphic();

}

function getRTI() {
    setTimeout(function () {
        getRTI();
    }, 1000);
    fetch("http://" + ADRESS + "/data/temperature,humidity,pressure,wind").then(m => m.json()).then(m => {
        document.getElementById('rti-temperature-text').innerText = m.temperature.value[0];
        document.getElementById('rti-humidity-text').innerText = m.humidity.value[0];
        document.getElementById('rti-pressure-text').innerText = m.pressure.value[0];
        document.getElementById('rti-wind-text').innerText = m.wind.value[0];
    });
}

function drawBigGraphic() {

    let station_adress = ADRESS;

    // get period
    var period = {};
    document.querySelectorAll(".select-temporaly-big-graph").forEach(element => {
        if (element.checked) {
            period.request = element.value;
        }
    });

    // remove canvas
    document.getElementById('big-station-graph').remove();
    document.getElementById('chart').innerHTML = "<canvas id='big-station-graph'></canvas>"

    // Get the date
    let now = new Date().toISOString();
    let delta = "2022-03-05T15:54:31.069Z";
    if (period.request == "All") {
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
    fetch("http://" + station_adress + "/data/" + measures.join(",") + "/" + delta).then(d => d.json()).then(d => {
        // TAke all the date
        const date = [];
        const data_measures = {
            "temperature": [],
            "humidity": [],
            "luminosity": [],
            "pressure": [],
            "wind": []
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