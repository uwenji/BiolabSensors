# BiolabSensors

# General Setup:

Configurations 
```
ifconfig
```

check the ip, it will be useful for remote control

turn on UART, I2C, SSH, VNC on configuration 
```
sudo raspi-config
```

Interface Options:
1. SSH  enable(for github or remote security)
2. VNC (remote control )
3. I2C enable
4. serial port
	- When prompted, choose `No` for the login shell to be accessible over serial.
	- Choose `Yes` to enable the serial hardware.

reboot `Yes` 


`sudo nano /boot/config.txt`  (raspbian 10)
`sudo nano /boot/firmare.txt` (raspbian 12)
add this lines in bottom
```
dtoverlay=disable-bt
dtoverlay=miniuart-bt
```

# GSS gas sensor:

check serial port connective:
```
ls -l /dev/serial*
```

how to list all the serial connection:
```
import serial.tools.list_ports

def list_serial_ports():
    ports = serial.tools.list_ports.comports()
    available_ports = []
    for port, desc, hwid in sorted(ports):
        print("{}: {} [{}]".format(port, desc, hwid))
        available_ports.append(port)
    return available_ports

if __name__ == "__main__":
    print("Avaiuble Serial Ports:")
    available_ports = list_serial_ports()
```

print out the co2 information from gss sensor:
```
import serial
import time

def process_sensor_data(data):
    # Splitting the data into lines
    lines = data.split('\n')

    # Extracting numbers from each line
    count = 0
    average = 0
    for line in lines:
        string =line.lstrip()
        if string.startswith('Z'):
            parts = string.split()
            for part in parts:
                if not part.startswith('Z') and not part.startswith('z'):
                    count+= 1
                    average+=int(part)
                    
    return int((average/count))

def send_command(ser, command):
    ser.write(command.encode('utf-8') + b'\r\n')  # Commands end with a carriage return and newline
    time.sleep(1)  # Wait a bit for the sensor to respond
    response = ser.read(ser.in_waiting).decode('utf-8')  # Read all data in the buffer
    return response.strip()

def read_ser():
    ser = serial.Serial('/dev/serial0',9600, timeout=1)

    try:
        #device_info = send_command(ser, 'Y')
        #response = ser.read(ser.in_waiting or 1)
        #print("Device Information:", device_info)
        
        device_info = send_command(ser, 'Z')
        response = ser.read(ser.in_waiting or 1)
        print(device_info)
        #ppm = process_sensor_data(device_info)
        return device_info #ppm
            
    except Exception as e:
        print("Error: {}".format(e))
    finally:
        ser.close()

if __name__ == "__main__":
    print(read_ser())
```

 the serial port `ser = serial.Serial('/dev/serial0',9600, timeout=1)` is reading signal from GPIO 14, 15(UART TX, RX). Changing `/dev/ttyUSB` to read sensor from usb connection.

# Atlas sensor

to detect i2c device connectivity 
```
sudo i2cdetect -y 1
```


`sudo apt-get install i2c-tools`,
`sudo apt install python3-smbus` (raspbian 12)

https://atlas-scientific.com/files/EZO_PMP_Datasheet.pdf
https://files.atlas-scientific.com/pi_sample_code.pdf
