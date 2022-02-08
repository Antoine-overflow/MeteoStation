function initMap() {
    var map = L.map('map').setView([51.505, -0.09], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);
}

initMap();