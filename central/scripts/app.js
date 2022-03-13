// HEADER
const header = new Vue({
    el: "#header",
    data: {
        path_logo: "media/img/logo.png",
        date: "XXXXXX"
    },
    methods: {
        setDate: function () {
            setTimeout(this.setDate, 1000);

            let date = new Date();
            let text = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ", " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

            this.date = text;
        }
    }
});

// PANNEL

// Pannel-button
Vue.component('pannel-button', {
    props: ['todo'],
    template: "<div v-bind:key='todo.id'><img v-bind:src='todo.path'><div v-if='todo.seen'><p>{{todo.text}}</p></div></div>"
})

// pannel
const pannel = new Vue({
    el: "#pannel",
    data: {
        width_style: "pannel_wide",
        min_width: 75,
        max_width: 300,
        switch_width: 600,
        list_button: [
            { id: 0, path: "media/img/home.png", text: "Home", seen: true},
            { id: 1, path: "media/img/stations.png", text: "Stations", seen: true},
            { id: 2, path: "media/img/map.png", text: "Map", seen: true},
            { id: 3, path: "media/img/bolt.png", text: "Compare", seen: true}
        ]
    },
    methods: {
        checkSize: function () {
            if (window.innerWidth <= this.switch_width) {
                this.width_style = "pannel_short";
                this.list_button.forEach(button => {
                    button.seen = false;
                });
            } else if (window.innerWidth > this.switch_width) {
                this.width_style = "pannel_wide";
                this.list_button.forEach(button => {
                    button.seen = true;
                });
            }
        },
        makeClickable: function(){
            let i = 0;
            document.querySelectorAll(".pannel-button").forEach(e => {
                e.setAttribute("id", "pannel-button-"+i);
                e.addEventListener("click", dash.reload);
                i++;
            });
        }
    }
});

const dash = new Vue({
    el: "#dash",
    methods: {
        reload: function(e) {
            // get key
            let key = e.currentTarget.id.split('-')[2];
            console.log(key);

            if (key == 0) {
                generateHome();
                return;
            }
            
            if (key == 1) {
                generateStations(0);
                return;
            }
            
            if (key == 2) {
                generateMap();
                return;
            }
            
            if (key == 3) {
                generateCompare();
                return;
            }
        },
    }
})

// TO RUN
header.setDate();
pannel.makeClickable();

// Stations
 const STATIONS = [
    {name: "Station locale", adresse: "localhost:3000"}
 ];