import sys
import os

# Add the project root to python path to import backend correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.ai.llm import generate_title_description, summarize_narrative, generate_blueprint

def test_groq():
    print("Testing generate_title_description...")
    res1 = generate_title_description(
        detections=[{"class_name": "Pothole", "confidence": 0.95}],
        image_caption="a road with a large pothole",
        category="Infrastructure"
    )
    print("Result:", res1)
    
    print("\nTesting summarize_narrative...")
    res2 = summarize_narrative(
        description="There is a huge pothole on Main st causing traffic issues.",
        detections=[{"class_name": "Pothole", "confidence": 0.95}],
        image_caption="a road with a large pothole"
    )
    print("Result:", res2)
    
    print("\nTesting generate_blueprint...")
    res3 = generate_blueprint(
        title=res1["title"],
        description=res1["description"],
        category="Infrastructure",
        severity="High"
    )
    print("Result:", res3)

if __name__ == "__main__":
    test_groq()
