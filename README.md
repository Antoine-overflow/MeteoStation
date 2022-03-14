# MeteoStation
Creation of a connected meteorological station with WEB technologies

We follow these instructions : https://ensg_dei.gitlab.io/web-az/js/exercices/projet-station-meteo/

Before running our application you must have docker and run the following line : 
``` bash
docker run -ti -p 8086:8086 -v influxdb:/var/lib/influxdb --name influxdb influxdb:1.8
```

Open a new terminal and run : 
```bash
docker exec -ti influxdb bash

# You are in root@81ae2e0ca5f7:/#
influx

# You are now in influx
CREATE DATABASE meteodb
```

You now have the database for the project. But, the database is empty and tu fulfill it you just have to run the following lines : 
(make sure that you have node installed on your computer)

``` bash
git clone https://github.com/Antoine-overflow/MeteoStation.git
cd MeteoStation/fakesonde
node server.js
``` 

Open a new terminal and go in the project folder and run : 
```bash
node server.js
```

Now you all is set. You just have to run the application.

To run the application run the following lines : 
``` bash
cd myapp
DEBUG=myapp:* npm start
``` 
# MeteoCentral

## Installation

Require apache2 server

```bash
ln -s <PATH TO ./central Folder> /var/www/html
```

## Run
Go to [http://localhost/central](http://localhost/central)

## Add station
Open the dev tool in your internet explorer, then open the console and you can add meteo station with this command:

```
STATIONS.push({name: <NOM DE LA STATION>, adresse: <ADRESSE DE LA STATION>});
```