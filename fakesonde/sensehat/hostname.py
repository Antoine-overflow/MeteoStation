#!/usr/bin/python3
from sense_hat import SenseHat
import socket
import time


sense = SenseHat()

message = socket.gethostname()

while True:
  sense.show_message(message)
  time.sleep(2)

