function generateMap() {
    console.log("MAP");
    // get element
    let element = document.getElementById('dash');

    element.innerHTML = "<div id='map'></div>";

    const map = L.map('map').setView([51.505, -0.09], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true
    }).addTo(map);

    // Add a marker where the station is
    for (let i = 0 ; i < STATIONS.length ; i++) {
        let s = STATIONS[i];
        fetch("http://" + s.adresse + "/data/gpsposition").then(g => g.json()).then(g => {
            let marker = L.marker([g.gpsposition.value[0], g.gpsposition.value[1]]).addTo(map);
            marker.bindPopup("<b>"+s.name+"</b><br>Adress: " + s.adresse + "</br><button onclick='generateStations("+i+")'>see station</button><br>Coords: " + g.gpsposition.value[0] + " , " + g.gpsposition.value[1] + "</br>");
        });
    };

}