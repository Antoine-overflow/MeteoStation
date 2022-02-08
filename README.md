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

You now have the database for the project.

To run the application run the following lines : 
``` bash
git clone https://github.com/Antoine-overflow/MeteoStation.git
cd MeteoStation/myapp
DEBUG=myapp:* npm start
``` 
