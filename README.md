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
# SSH setup and Git preparation:

run this 
```
sudo nano /etc/apt/sources.list
```

add this line
```
deb http://raspbian.raspberrypi.org/raspbian/ buster main contrib non-free rpi
```

```
sudo apt update
sudo apt full-upgrade

sudo apt autoremove
sudo apt clean

sudo reboot
```

run this line and replace your github email
```
ssh-keygen -t rsa -b 4096 -C "github@email.com"

```

 should something like this
```
**pi@raspberrypi**:**~ $** ssh-keygen -t rsa -b 4096 -C "yw.ji90@gmail.com"

Generating public/private rsa key pair.

Enter file in which to save the key (/home/pi/.ssh/id_rsa): 

Created directory '/home/pi/.ssh'.

Enter passphrase (empty for no passphrase): 

Enter same passphrase again: 

Your identification has been saved in /home/pi/.ssh/id_rsa

Your public key has been saved in /home/pi/.ssh/id_rsa.pub

The key fingerprint is:

SHA256:A+y21+ss3uheMWVtHBlPvsTtIJ32qGoHAKAI/87ihSM yw.ji90@gmail.com

The key's randomart image is:

+---[RSA 4096]----+

|.   ..        oo.|

|.o . ..      +o*.|

|. o   o.    + Oo+|

|   . . ..  o +.=.|

|    . o S.o   ..o|

|   + . . o.o .   |

|E + + . . o..    |

| o +   ..=.o.    |

|  .    +=+*.     |

+----[SHA256]-----+
```

then take ssh token from this 
```
cat ~/.ssh/id_rsa.pub
```
then copy the ssh token and add into your github account
in your github Settings-->SSH and GPG keys

```
git clone git@github.com:uwenji/BiolabSensors.git
```

then cd to your repository folder

```
git config --global user.email "your@email.com"

git config --global user.name "github account name"
```


# GSS gas sensor:

check serial port connective:
```
ls -l /dev/serial*
```
run print serial by run `python3 printSerial.py`
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
should like this. in this case we have 4 i2c device 
```
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f

00:                         -- -- -- -- -- -- -- -- 

10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

40: -- -- 42 43 -- -- -- -- -- -- -- -- -- -- -- -- 

50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

60: -- -- -- -- 64 -- -- 67 -- -- -- -- -- -- -- -- 

70: -- -- 72 -- -- -- -- --
```

install 
```
sudo apt-get install i2c-tools
sudo apt install python3-smbus
```

run `python3 i2c.py`

```
>> Atlas Scientific I2C sample code

>> Any commands entered are passed to the default target device via I2C except:

  - Help

      brings up this menu

  - List 

      lists the available I2C circuits.

      the --> indicates the target device that will receive individual commands

  - xxx:[command]

      sends the command to the device at I2C address xxx 

      and sets future communications to that address

      Ex: "102:status" will send the command status to address 102

  - all:[command]

      sends the command to all devices

  - Poll[,x.xx]

      command continuously polls all devices

      the optional argument [,x.xx] lets you set a polling time

      where x.xx is greater than the minimum 1.50 second timeout.

      by default it will poll every 1.50 seconds

>> Pressing ctrl-c will stop the polling

--> RTD 66 

 - RTD 67 

 - pH 100 

 - PMP 103 

 - PMP 114 

>> Enter command:
```

RTD --> temperature sensor
pH --> pH sensor
PMP --> pump

https://atlas-scientific.com/files/EZO_PMP_Datasheet.pdf
https://files.atlas-scientific.com/pi_sample_code.pdf
