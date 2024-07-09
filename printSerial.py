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