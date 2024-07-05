import serial
import subprocess
import time
import os
import csv

def main():
    second = time.time()
    local_time = time.ctime(second)
    
    try:
        # Adding the CSV file to the staging area
        subprocess.run(["git", "add", "O2_CO2_Data.csv"], check=True)

        # Committing the changes
        commit_message = "Update CO2,O2 readings for {}".format(local_time)
        subprocess.run(["git", "commit", "-m", commit_message], check=True)

        # Pushing the changes to the GitHub repository
        subprocess.run(["git", "push"], check=True)
    except subprocess.CalledProcessError as e:
        print("Error in Git operation: {}".format(e))

        
if __name__ == "__main__":
    main()
