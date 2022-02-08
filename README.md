# MeteoStation
Creation of a connected meteorological station with WEB technologies

We follow these instructions : https://ensg_dei.gitlab.io/web-az/js/exercices/projet-station-meteo/

Before running our application you must have docker and run the following lines : 
``` bash
docker pull influxdb
docker run -ti -p 8086:8086 -v influxdb:/var/lib/influxdb influxdb:1.8 bash

# You are in the bash of influxdb 
root@56663630a44b:/ CREATE DATABASE meteodb
```

You now have the database for the project.

To run the application run the following lines : 
``` bash
git clone https://github.com/Antoine-overflow/MeteoStation.git
cd MeteoStation/myapp
DEBUG=myapp:* npm start
``` 
