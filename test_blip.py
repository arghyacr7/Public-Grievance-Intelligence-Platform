import sys
from pathlib import Path
from PIL import Image
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.ai.captioning import generate_caption

def test_blip():
    print("--- Testing Pothole Image ---")
    img1 = Image.open("uploads/1_Potholes-resized-for-blog.jpg").convert("RGB")
    caption1 = generate_caption(img1)
    print("Pothole Caption:", caption1)

    print("\n--- Testing Garbage Image ---")
    garbage_path = "uploads/1_istockphoto-1160642619-2048x2048.jpg"
    if os.path.exists(garbage_path):
        img2 = Image.open(garbage_path).convert("RGB")
        caption2 = generate_caption(img2)
        print("Garbage Caption:", caption2)
    else:
        print("Garbage image not found.")

if __name__ == "__main__":
    test_blip()
