import sys
from pathlib import Path
from PIL import Image
import os

# Add the project root to python path to import backend correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.ai.detector import detect_issues, load_model

def test_models():
    # Force load models
    print("Loading models...")
    load_model()
    
    # Test pothole
    print("\n--- Testing Pothole Image ---")
    pothole_path = Path("uploads/1_Potholes-resized-for-blog.jpg")
    if pothole_path.exists():
        img = Image.open(pothole_path).convert("RGB")
        res = detect_issues(img)
        print("Result:", res)
    else:
        print("Pothole image not found")

    # Test garbage
    print("\n--- Testing Garbage Image ---")
    # Let's see if there is a garbage image, or we can use another one
    garbage_path = Path("uploads/1_istockphoto-1160642619-2048x2048.jpg")
    if garbage_path.exists():
        img = Image.open(garbage_path).convert("RGB")
        res = detect_issues(img)
        print("Result:", res)
    else:
        print("Garbage image not found")

if __name__ == "__main__":
    test_models()
