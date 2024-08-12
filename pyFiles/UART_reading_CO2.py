import serial
import io
import sys
import fcntl
import time
import copy
import string
import os
import csv

def saveCSV(file_Path, Data):
    second = time.time()
    local_time =time.ctime(second)
    new_titles = [
        ["Time","Local Time","CO2_1","CO2_2"],
        ]
    csv_file = file_Path
    
    if not os.path.isfile(csv_file):
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(new_titles)
    
    else:
        with open(csv_file, mode='a', newline='') as file:
            local_time = time.ctime(second)
            #ppm = read_USB()
            #o2_ppm = read_ser()
            new_data = []
            express = []
            express.append(str(second))
            express.append(local_time)
            for d in Data:
                express.append(d + "\n")
            #express.append(str(ppm) + "\n")
            #express.append(str(o2_ppm) + "\n")
            new_data.append(express)
            writer = csv.writer(file)
            writer.writerows(new_data)
            print(express)
            
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
    ser = serial.Serial('/dev/ttyAMA0',9600, timeout=1) #replace usb by '/dev/ttyUSB0'

    try:
        #device_info = send_command(ser, 'Y')
        #response = ser.read(ser.in_waiting or 1)
        #print("Device Information:", device_info)
        
        device_info = send_command(ser, 'Z')
        response = ser.read(ser.in_waiting or 1)
        #print(device_info)
        ppm = process_sensor_data(device_info)
        return ppm #device_info
            
    except Exception as e:
        print("Error: {}".format(e))
    finally:
        ser.close()

def read_USB():
    ser = serial.Serial('/dev/ttyUSB0',9600, timeout=1) 

    try:
        device_info = send_command(ser, 'Z')
        response = ser.read(ser.in_waiting or 1)
        #print(device_info)
        ppm = process_sensor_data(device_info)
        return ppm #device_info
            
    except Exception as e:
        print("Error: {}".format(e))
    finally:
        ser.close()
        
def main():
    #reading sensor values
    data = []
    ppm1 = read_USB()
    time.sleep(1)
    data.append(str(ppm1))
    print(str(ppm1) + " ppm")
    ppm2 = read_ser()
    time.sleep(1)
    data.append(str(ppm2))
    print(str(ppm2) + " ppm")

     #save csv file location
    saveCSV("/home/pi/Desktop/BiolabSensors/data/co2.csv",data)
if __name__ == "__main__":
    main()
