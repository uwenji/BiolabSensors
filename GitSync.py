import subprocess
import os
import time

# Change these variables to match your setup
repo_path = '/home/pi/Desktop/BiolabSensors'
commit_message = 'Automated commit message'

def run_git_command(command, cwd=None):
    result = subprocess.run(command, cwd=cwd, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    return result.stdout.strip(), result.returncode

def git_pull():
    return run_git_command('git pull origin main', cwd=repo_path)

def git_add_all():
    return run_git_command('git add .', cwd=repo_path)

def git_commit(message):
    return run_git_command(f'git commit -m "{message}"', cwd=repo_path)

def git_push():
    return run_git_command('git push origin main', cwd=repo_path)

def git_sync():
    print("Pulling latest changes...")
    pull_output, pull_returncode = git_pull()
    print(pull_output)
    
    if pull_returncode != 0:
        print("Failed to pull changes. Aborting sync.")
        return
    
    print("Adding files to git...")
    add_output, add_returncode = git_add_all()
    print(add_output)
    
    if add_returncode == 0:
        print("Committing changes...")
        commit_output, commit_returncode = git_commit(commit_message)
        print(commit_output)
        
        if commit_returncode == 0:
            print("Pushing to repository...")
            push_output, push_returncode = git_push()
            print(push_output)
            
            if push_returncode != 0:
                print("Failed to push changes. Aborting sync.")
                return
        else:
            print("Nothing to commit.")
    else:
        print("No changes to add.")
    
if __name__ == "__main__":
    try:
        # Ensure you are in the correct directory
        os.chdir(repo_path)
        
        # Sync files with the repository
        git_sync()
    except Exception as e:
        print(f"An error occurred: {e}")

