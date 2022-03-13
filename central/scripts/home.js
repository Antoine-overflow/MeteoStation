function generateHome(){
    console.log("HOME");
    let element = document.getElementById('dash');

    // generate all station
    element.innerHTML = "<div id='home_css_grid'></div>"
    let grid = document.getElementById('home_css_grid');

    // add element in the grid
    let html = '';

    for(var i = 0 ; i < STATIONS.length ; i++) {
        html += "<div class='stations-box' id='station-box-"+i+"'><h3>"+STATIONS[i].name+"<h3><p>"+STATIONS[i].adresse+"</p></div>";

    }

    grid.innerHTML = html;

    // Add event
    document.querySelectorAll('.stations-box').forEach(el => {
        el.addEventListener('click' , e => {
            let key = e.currentTarget.id.split('-')[2];
            generateStations(key);
        });
    });
}