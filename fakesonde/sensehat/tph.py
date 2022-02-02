#!/usr/bin/python3
#coding: utf-8

import os
from time import sleep
from datetime import datetime
from sense_hat import SenseHat


interval = 1
logfilePath = "/dev/shm/tph.log"
#logfile=open(logfilePath,"w")


def loop():
 
  while True:
 
    sense = SenseHat()
    humidity = sense.get_humidity()
    temp = sense.get_temperature()
    pressure = sense.get_pressure()
    date = datetime.now().isoformat()
    
    logfile=open(logfilePath,"w")
    logfile.write('{"date":"%s" ,"temp":%.3f,"hygro":%.3f,"press":%.3f}\n'%(date,temp,humidity,pressure))
    logfile.close()
    
    sleep(interval)
###########################


def destroy():
  pass


if __name__ == '__main__':     # Program start from here

  try:
    loop()
  except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
    logfile.close()
    destroy()


