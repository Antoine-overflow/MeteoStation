#!/usr/bin/python3

from sense_hat import SenseHat
import os

sense = SenseHat()
humidity = sense.get_humidity()
print("Humidity: %s %%rH" % humidity)

# alternatives
#print(sense.humidity)

temp = sense.get_temperature()
print("Temperature: %s C" % temp)

# alternatives
#print(sense.temp)
#print(sense.temperature)

temp = sense.get_temperature_from_humidity()
print("Temperature from Humidity sensor: %s C" % temp)

temp = sense.get_temperature_from_pressure()
print("Temperature from Pressure sensor: %s C" % temp)

pressure = sense.get_pressure()
print("Pressure: %s Millibars" % pressure)

# alternatives
#print(sense.pressure)


def get_cpu_temp():
    res = os.popen('vcgencmd measure_temp').readline()
    return float(res.replace("temp=", "").replace("'C\n", ""))


def get_temp(sense):
    t1 = sense.get_temperature_from_humidity()
    t2 = sense.get_temperature_from_pressure()
    t = (t1 + t2) / 2
    t_cpu = get_cpu_temp()
    print("tcpu %s %s %s" % (t_cpu,t1,t2))
    t_corr = t - ((t_cpu - t) / 1.5)
    return t_corr

sense = SenseHat()

humidity = sense.get_humidity()
pressure = sense.get_pressure()

print("%s %s %s" % (get_temp(sense), humidity, pressure))
