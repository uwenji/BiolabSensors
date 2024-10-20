import csv

input_file = '/home/pi/Desktop/BiolabSensors/data/co2.csv'
output_file = '/home/pi/Desktop/BiolabSensors/data/co2_cleaned.csv'

try:
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        for row in reader:
            cleaned_row = [field.replace('\n', '').replace('"', '') for field in row]
            writer.writerow(cleaned_row)
    print("file cleaed and saved successfully.")
except Exception as e:
    print(f"An error occurred: {e}")
