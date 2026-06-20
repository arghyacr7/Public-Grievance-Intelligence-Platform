import os
import json
import joblib
from pathlib import Path
from ..models import SeverityEnum

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "grievance_models" / "severity_model.pkl"

rf_model = None

def load_severity_model():
    global rf_model
    if rf_model is None and MODEL_PATH.exists():
        try:
            rf_model = joblib.load(MODEL_PATH)
        except Exception:
            pass

def extract_features(detections: list, category: str):
    num_detections = len(detections)
    if num_detections == 0:
        return [0, 0, 0, 0, 0]
        
    max_conf = max([d['confidence'] for d in detections])
    avg_conf = sum([d['confidence'] for d in detections]) / num_detections
    
    # Calculate approx area ratio
    total_area = 0
    for d in detections:
        try:
            bbox = json.loads(d['bbox_json'])
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            total_area += (w * h)
        except:
            pass
            
    # Normalize area by typical image size (640x640)
    area_ratio = total_area / (640 * 640)
    
    category_code = 1 if category.lower() == "pothole" else 0
    return [num_detections, max_conf, avg_conf, area_ratio, category_code]

def predict_severity(detections: list, category: str):
    if not detections:
        return SeverityEnum.low, 0.0

    load_severity_model()
    features = extract_features(detections, category)
    
    if rf_model is not None:
        try:
            severity_idx = rf_model.predict([features])[0]
            probs = rf_model.predict_proba([features])[0]
            score = float(probs[severity_idx])
            
            mapping = {0: SeverityEnum.low, 1: SeverityEnum.medium, 2: SeverityEnum.high, 3: SeverityEnum.critical}
            return mapping.get(severity_idx, SeverityEnum.medium), score
        except Exception:
            pass

    # Fallback Rules
    num_detections = features[0]
    area_ratio = features[3]
    
    if num_detections > 5 or area_ratio > 0.3:
        return SeverityEnum.critical, 0.9
    elif num_detections > 2 or area_ratio > 0.1:
        return SeverityEnum.high, 0.8
    elif num_detections > 0:
        return SeverityEnum.medium, 0.6
    else:
        return SeverityEnum.low, 0.3
