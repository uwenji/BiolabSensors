import csv

input_file = 'co2.csv'
output_file = 'co2_cleaned.csv'

with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    for row in reader:
        cleaned_row = [field.replace('\n', '').replace('"', '') for field in row]
        writer.writerow(cleaned_row)
