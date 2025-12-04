import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

try:
    import backend.main
    print("Successfully imported backend.main")
except Exception as e:
    import traceback
    traceback.print_exc()
