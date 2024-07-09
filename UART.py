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
    ser = serial.Serial('/dev/ttyAMA0',9600, timeout=1) #replace usb by '/dev/ttyUSB0'

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