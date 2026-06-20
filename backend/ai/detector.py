import os
from PIL import Image
from ultralytics import YOLO
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ML_MODELS_DIR = BASE_DIR / "grievance_models"

POTHOLE_MODEL_PATH = ML_MODELS_DIR / "pothole_seg_model.pt"
GARBAGE_MODEL_PATH = ML_MODELS_DIR / "garbage_model.pt"

POTHOLE_MODEL = None
GARBAGE_MODEL = None

def load_model():
    global POTHOLE_MODEL, GARBAGE_MODEL
    # Load pothole detection model if exists
    if POTHOLE_MODEL_PATH.exists():
        POTHOLE_MODEL = YOLO(str(POTHOLE_MODEL_PATH))
        print(f"Loaded local pothole model from {POTHOLE_MODEL_PATH}.")
    else:
        print(f"Warning: Pothole model not found at {POTHOLE_MODEL_PATH}. Run training script.")
        
    # Load garbage classification model if exists
    if GARBAGE_MODEL_PATH.exists():
        GARBAGE_MODEL = YOLO(str(GARBAGE_MODEL_PATH))
        print(f"Loaded local garbage classification model from {GARBAGE_MODEL_PATH}.")
    else:
        print(f"Warning: Garbage model not found at {GARBAGE_MODEL_PATH}. Run training script.")

def detect_issues(image: Image.Image):
    detections = []
    
    # Run Pothole Segmentation Inference
    if POTHOLE_MODEL:
        try:
            results = POTHOLE_MODEL(image)
            for result in results:
                # result contains boxes and masks
                boxes = result.boxes
                masks = result.masks
                
                if boxes is not None:
                    for i, box in enumerate(boxes):
                        conf = float(box.conf[0])
                        cls_idx = int(box.cls[0])
                        class_name = POTHOLE_MODEL.names[cls_idx]
                        
                        if conf > 0.05:
                            # Standard bounding box
                            bbox = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                            
                            # Segmentation polygon (if available)
                            polygon = []
                            if masks is not None and masks.xy and len(masks.xy) > i:
                                polygon = masks.xy[i].tolist() # List of [x, y]
                            
                            detections.append({
                                "class_name": f"Pothole ({class_name.title()})",
                                "confidence": round(conf, 4),
                                "bbox_json": str(bbox),
                                "polygon_json": str(polygon) if polygon else "[]"
                            })
        except Exception as exc:
            print(f"Pothole segmentation inference failed: {exc}")
            
    # Run Garbage Image Classification
    if GARBAGE_MODEL:
        try:
            results = GARBAGE_MODEL(image)
            for result in results:
                # result.probs contains probabilities for classification
                top1_idx = result.probs.top1
                top1_conf = float(result.probs.top1conf)
                class_name = GARBAGE_MODEL.names[top1_idx]
                
                # We add garbage detection if confidence is decent (lowered to 0.05 for testing)
                # Since we don't have a bounding box for the whole image, we create a full-image box
                if top1_conf > 0.05:
                    width, height = image.size
                    detections.append({
                        "class_name": f"Garbage ({class_name.title()})",
                        "confidence": round(top1_conf, 4),
                        "bbox_json": str([0.0, 0.0, float(width), float(height)]),
                    })
        except Exception as exc:
            print(f"Garbage classification inference failed: {exc}")

    return detections
